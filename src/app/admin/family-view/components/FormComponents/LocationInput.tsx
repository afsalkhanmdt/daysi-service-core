"use client";

import Image from "next/image";
import React, { useState, useEffect, useCallback, useRef } from "react";
import locationIcon from "@/app/admin/assets/location.png";

interface LocationInputProps {
  value: string;
  onChange: (value: string, lat?: number, lng?: number) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  showGetCurrentLocation?: boolean;
  showSuggestions?: boolean;
  debounceMs?: number;
}

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

// Helper function to check if string contains coordinates
const isCoordinateString = (str: string): boolean => {
  const coordinatePattern = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/;
  return coordinatePattern.test(str.trim());
};

// Extract coordinates from string
const extractCoordinates = (
  str: string,
): { lat: number; lng: number } | null => {
  if (!isCoordinateString(str)) return null;

  const [lat, lng] = str.split(",").map((coord) => parseFloat(coord.trim()));
  return { lat, lng };
};

const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChange,
  placeholder = "Location",
  required = false,
  className = "",
  showGetCurrentLocation = true,
  showSuggestions = true,
  debounceMs = 500,
}) => {
  const [locationLoading, setLocationLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);
  const [shouldSearch, setShouldSearch] = useState(false);

  // Use ref to track if we've already attempted reverse geocoding for initial value
  const initialGeocodeAttempted = useRef(false);

  // Function to reverse geocode coordinates
  const reverseGeocodeCoordinates = useCallback(
    async (lat: number, lng: number) => {
      setLocationLoading(true);

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        );
        const data = await res.json();

        // Extract the most relevant place name
        let placeName = data?.display_name || `${lat}, ${lng}`;

        // Try to get a shorter, more readable version
        if (data?.address) {
          const { road, city, town, village, county, state, country } =
            data.address;
          const parts = [];
          if (road) parts.push(road);
          if (city || town || village) parts.push(city || town || village);
          if (state) parts.push(state);
          if (parts.length > 0) {
            placeName = parts.join(", ");
          }
        }

        setDisplayValue(placeName);
        setShouldSearch(false);
        onChange(placeName, lat, lng);
      } catch (error) {
        console.error("Reverse geocoding failed:", error);
        // Keep the original coordinates as display value
        setDisplayValue(`${lat}, ${lng}`);
      } finally {
        setLocationLoading(false);
      }
    },
    [onChange],
  );

  // Handle initial value - if it contains coordinates, reverse geocode them
  useEffect(() => {
    // Skip if we've already attempted geocoding for this value
    if (initialGeocodeAttempted.current && displayValue === value) {
      return;
    }

    // Update display value when prop changes
    setDisplayValue(value);

    // Check if the value contains coordinates
    const coordinates = extractCoordinates(value);

    // If it's coordinates and we haven't attempted geocoding yet
    if (coordinates && !initialGeocodeAttempted.current) {
      initialGeocodeAttempted.current = true;
      reverseGeocodeCoordinates(coordinates.lat, coordinates.lng);
    } else if (!coordinates) {
      // If it's not coordinates, just use the value as is
      setDisplayValue(value);
      setShouldSearch(false);
    }
  }, [value, reverseGeocodeCoordinates]);

  // Debounced location search
  useEffect(() => {
    if (!showSuggestions || !displayValue || displayValue.length < 3 || !shouldSearch) {
      if (!shouldSearch) {
        setSuggestions([]);
        setShowSuggestionsDropdown(false);
      }
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            displayValue,
          )}&limit=5&addressdetails=1`,
        );
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestionsDropdown(true);
      } catch (error) {
        console.error("Error fetching location suggestions:", error);
      } finally {
        setIsSearching(false);
      }
    }, debounceMs);

    return () => clearTimeout(searchTimeout);
  }, [displayValue, debounceMs, showSuggestions, shouldSearch]);

  const handleGetCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          });
        },
      );

      const { latitude, longitude } = position.coords;
      await reverseGeocodeCoordinates(latitude, longitude);
    } catch (error) {
      console.error(error);
      alert("Unable to retrieve your location.");
    } finally {
      setLocationLoading(false);
    }
  }, [reverseGeocodeCoordinates]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDisplayValue(newValue);
    setShouldSearch(true);
    // Reset the initial geocode flag when user starts typing
    initialGeocodeAttempted.current = false;
  };

  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    setDisplayValue(suggestion.display_name);
    setShouldSearch(false);
    onChange(
      suggestion.display_name,
      parseFloat(suggestion.lat),
      parseFloat(suggestion.lon),
    );
    setShowSuggestionsDropdown(false);
    setSuggestions([]);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestionsDropdown(false);
    }, 200);

    if (displayValue !== value) {
      onChange(displayValue);
    }
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestionsDropdown(true);
    }
  };

  const formatSuggestionDisplay = (displayName: string): string => {
    const parts = displayName.split(",");
    if (parts.length > 3) {
      return parts.slice(0, 3).join(",") + "...";
    }
    return displayName;
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={`w-full px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm ${className}`}
          required={required}
          autoComplete="off"
          disabled={locationLoading}
        />

        {showGetCurrentLocation && (
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={locationLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition"
            title="Get current location"
          >
            {locationLoading ? (
              <span className="text-[10px] animate-pulse">📍</span>
            ) : (
              <Image
                src={locationIcon}
                alt="Get Current Location"
                width={12}
                height={12}
                className="cursor-pointer"
              />
            )}
          </button>
        )}
      </div>

      {/* Loading indicator for search */}
      {isSearching && (
        <div className="absolute right-8 top-1/2 -translate-y-1/2">
          <span className="text-[10px] text-gray-400 animate-pulse">
            ...
          </span>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && showSuggestionsDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              type="button"
              className="w-full text-left px-3 py-1.5 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors"
              onClick={() => handleSuggestionSelect(suggestion)}
              onMouseDown={(e) => e.preventDefault()}
            >
              <div className="text-[11px] text-gray-900 leading-tight">
                {formatSuggestionDisplay(suggestion.display_name)}
              </div>
              <div className="text-[9px] text-gray-500 mt-0.5 truncate">
                {suggestion.display_name}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions &&
        showSuggestionsDropdown &&
        !isSearching &&
        displayValue.length >= 3 &&
        suggestions.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-2 text-center text-[10px] text-gray-500">
            No locations found.
          </div>
        )}
    </div>
  );
};

export default LocationInput;

"use client";
import apiUrl from "@/config/apiUrl";
import { useEffect, useState, useCallback } from "react";

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useFetch<T>(url: string | null, options?: RequestInit) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchData = useCallback(async () => {
    // ⬅️ ADD SERVER CHECK HERE
    if (!url || typeof window === "undefined") return;

    setState((prev) => ({ ...prev, loading: true }));

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(apiUrl + url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
          ...(options?.headers || {}),
        },
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);

      let json = await res.json();

      // 🪄 normalize if array with single object
      if (Array.isArray(json) && json.length === 1) {
        json = json[0];
      }

      setState({ data: json as T, loading: false, error: null });
    } catch (err: any) {
      setState({ data: null, loading: false, error: err.message });
    }
  }, [url, options]);

  useEffect(() => {
    // ⬅️ ADD SERVER CHECK HERE TOO
    if (typeof window === "undefined") return;
    
    if (url) {
      fetchData();
    }
  }, [fetchData, url]); // ⬅️ Make sure url is in dependencies

  return { ...state, reload: fetchData, setData: (newData: T) => setState(prev => ({ ...prev, data: newData })) };
}
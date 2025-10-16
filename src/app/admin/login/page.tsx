"use client";

import { useState, useEffect } from "react";
import { AdminLoginCall } from "@/services/api/apiCall";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import emailPlaceholderLogo from "../assets/inputEmailIcon.svg";
import passwordPlaceholderLogo from "../assets/inputLockIcon.svg";
import danishAndNorwegianLogo from "@/app/admin/assets/DaysiDanishLogo.png";
import enLogo from "@/app/admin/assets/DaysiEnLogo.png";
import swedishLogo from "@/app/admin/assets/DaysiSwedishLogo.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLanguage, setUserLanguage] = useState("en");
  const router = useRouter();

  useEffect(() => {
    const lang =
      typeof navigator !== "undefined"
        ? navigator.language.slice(0, 2).toLowerCase()
        : "en";
    setUserLanguage(lang);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Basic validation
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      setLoading(false);
      return;
    }

    try {
      const res = await AdminLoginCall(username, password);
      localStorage.setItem("access_token", res.access_token);
      // Store additional user info if needed
      localStorage.setItem("familyId", res.familyId);
      localStorage.setItem("memberId", res.memberId);

      router.push(
        `/admin/family-view/?familyId=${res.familyId}&memberId=${res.memberId}`
      );
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const getLogoForLanguage = () => {
    if (userLanguage === "sv") return swedishLogo;
    if (userLanguage === "da" || userLanguage === "no")
      return danishAndNorwegianLogo;
    return enLogo;
  };

  return (
    <div className="grid h-screen w-screen place-items-center bg-gradient-to-r from-emerald-400 to-sky-500 p-10">
      <div className="bg-white rounded-2xl shadow-xl p-8 grid place-items-center sm:gap-4 w-full max-w-md">
        <Image
          src={getLogoForLanguage().src}
          alt="Daysi Logo"
          width={300}
          height={60}
          className="w-64 h-12 object-contain mb-4"
        />
        <form className="grid gap-6 w-full" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <h2 className="text-2xl font-bold text-center text-gray-800">
              All Your Family Plans
            </h2>
            <h3 className="text-sm text-center text-gray-600">
              Log in to access your shared family calendar, events, and
              reminders.
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <Image
                  src={emailPlaceholderLogo.src}
                  alt="Email icon"
                  width={20}
                  height={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="hello@gmail.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition duration-200"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Image
                  src={passwordPlaceholderLogo.src}
                  alt="Password icon"
                  width={20}
                  height={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition duration-200"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-sky-500"
                  disabled={loading}
                />
                Remember me
              </label>
              <Link
                href="#"
                className="text-sky-500 hover:underline transition duration-200"
              >
                Forgot Password?
              </Link>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm text-center font-medium">
                  {error}
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            className={`w-full py-3 px-4 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg transition duration-300 flex items-center justify-center ${
              loading ? "opacity-70 cursor-not-allowed" : "hover:shadow-lg"
            }`}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

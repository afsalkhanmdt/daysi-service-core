"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import emailPlaceholderLogo from "../assets/inputEmailIcon.svg";
import mainIcon from "@/app/admin/assets/2026-03-06 NEW MyFamilii Header - ONLY Logo Black TAG line CROP.png";
import { ForgotPasswordCall } from "@/services/api/apiCall";

const ForgotPassword = () => {
  const [userName, setUserName] = useState("");
  const [familyId, setFamilyId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userLanguage, setUserLanguage] = useState("en");

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
    setSuccessMessage(null);
    setLoading(true);

    if (!userName.trim()) {
      setError("Please enter your username or email address.");
      setLoading(false);
      return;
    }

    try {
      await ForgotPasswordCall({
        UserName: userName.trim(),
        FamilyId: familyId ? Number(familyId) : null,
        Locale: userLanguage || "en",
      });

      setSuccessMessage(
        "A temporary password has been generated and sent to your registered email address."
      );
      setUserName("");
      setFamilyId("");
    } catch (err: any) {
      console.error("Forgot password failed:", err);
      setError(
        err.message || "Unable to reset password. Please check your username/email."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid h-screen w-screen place-items-center bg-gradient-to-r from-emerald-400 to-sky-500 p-6 sm:p-10">
      <div className="bg-white rounded-2xl shadow-xl p-8 grid place-items-center sm:gap-4 w-full max-w-md">
        <Image
          src={mainIcon.src}
          alt="Daysi Logo"
          width={300}
          height={60}
          className="w-80 h-20 object-contain"
        />

        <form className="grid gap-6 w-full" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <h2 className="text-2xl font-bold text-center text-gray-800">
              Reset Your Password
            </h2>
            <h3 className="text-sm text-center text-gray-600">
              Enter your username or registered email to receive a new temporary password.
            </h3>
          </div>

          {successMessage ? (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-1">
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Email Sent!</span>
                </div>
                <p className="text-emerald-600 text-sm">{successMessage}</p>
              </div>

              <Link
                href="/admin/login"
                className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg transition duration-300 flex items-center justify-center text-center"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username or Email
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
                    placeholder="Enter your email or username"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition duration-200"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Family ID <span className="text-xs text-gray-400">(Optional - for sub-member accounts)</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1045"
                  value={familyId}
                  onChange={(e) => setFamilyId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition duration-200"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm text-center font-medium">
                    {error}
                  </p>
                </div>
              )}

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
                    Sending Reset Request...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/admin/login"
                  className="text-sm text-sky-500 hover:underline transition duration-200"
                >
                  &larr; Back to Login
                </Link>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;

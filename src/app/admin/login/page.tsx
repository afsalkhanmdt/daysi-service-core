"use client";

import { useState } from "react";
import { AdminLoginCall } from "@/services/api/apiCall";
import Link from "next/link";
import { useRouter } from "next/navigation";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false); // To handle loading state
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await AdminLoginCall(username, password);
            console.log("Login success:", res);

            localStorage.setItem("access_token", res.access_token);

            await delay(100000); // wait 1 second before redirecting

            router.push("/admin/family-view");
        } catch (err) {
            console.error("Login failed:", err);
            setError("Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid h-screen w-screen place-items-center bg-gradient-to-r from-emerald-400 to-sky-500">
            <div className="bg-white rounded-2xl shadow-xl p-8">
                <form className="grid gap-8" onSubmit={handleSubmit}>
                    <div className="grid gap-3">
                        <h2 className="text-2xl font-bold text-center text-gray-800">
                            All Your Family Plans
                        </h2>
                        <h3 className="text-lg text-center text-gray-600">
                            Log in to access your shared family calendar, events, and
                            reminders.
                        </h3>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
                            disabled={loading}
                            required
                        />
                        <label className="block text-sm font-medium text-gray-700 mt-4">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
                            disabled={loading}
                            required
                        />
                        <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" className="accent-sky-500" disabled={loading} />
                                Remember me
                            </label>
                            <Link href="#" className="text-sky-500 hover:underline">
                                Forgot Password?
                            </Link>
                        </div>
                        {error && (
                            <p className="text-red-600 mt-3 text-center font-medium">{error}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        className={`w-full py-2 px-4 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg transition duration-300 ${loading ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;

import Link from "next/link";

const Login = () => {
    return (
        <div className="grid h-screen w-screen place-items-center bg-gradient-to-r from-emerald-400 to-sky-500">
            <div className=" bg-white rounded-2xl shadow-xl p-8">
                <form className="grid gap-8">
                    <div className="grid gap-3">
                        <h2 className="text-2xl font-bold text-center text-gray-800 ">All Your  Family  Plans </h2>
                        <h3 className="text-lg text-center text-gray-600 ">Log in to access your shared family calendar, events, and reminders.</h3>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 ">Username</label>
                        <input
                            type="text"
                            placeholder="Username"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 "
                        />
                        <label className="block text-sm font-medium text-gray-700 ">Password</label>
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 "
                        />
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" className="accent-sky-500" />
                                Remember me
                            </label>
                            <Link href="#" className="text-sky-500 hover:underline">
                                Forgot Password?
                            </Link>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg transition duration-300 "
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Reset error

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Redirect to home page after successful login
      router.push("/");
    } catch {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      {/* <div className="p-6">
        <header className="bg-gray-900 text-white p-4 shadow-md">
          <div className="container mx-auto">
            <h1 className="text-xl font-semibold text-center">Argentic Blog</h1>
          </div>
        </header>
      </div> */}
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">

        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-semibold text-center mb-6">
            Login to ArgenticBlog
          </h1>

          {error && <p className="text-red-500 text-center">{error}</p>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-300">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-2 mt-1 rounded-md bg-gray-700 border border-gray-600 text-gray-300 focus:ring focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-300">Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-2 mt-1 rounded-md bg-gray-700 border border-gray-600 text-gray-300 focus:ring focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition duration-200"
            >
              Login
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/signup" className="text-blue-400 hover:underline">
              Sign Up
            </Link>
            <span className="text-gray-400 mx-2">|</span>
            <Link href="/change-password" className="text-blue-400 hover:underline">
              Change Password
            </Link>
            <span className="text-gray-400 mx-2">|</span>
            <Link href="/" className="text-blue-400 hover:underline">
              Login as Guest
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
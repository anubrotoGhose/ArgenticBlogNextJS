"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Check if username or email already exists
      const { data: existingUsername } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username);

      const { data: existingEmail } = await supabase
        .from("profiles")
        .select("email")
        .eq("email", email);

      if (existingUsername?.length) {
        setError("Username is already taken. Please choose a different one.");
        return;
      }
      if (existingEmail?.length) {
        setError("Email is already in use. Please choose a different one.");
        return;
      }

      // Sign up the user
      const { error: signupError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signupError) throw signupError;

      // Insert user profile data
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          email,
          username,
          commentidlist: [],
          articleidlist: [],
          ratingsidlist: [],
          profile_photo: "https://pgpevfnwbddeankyqrhz.supabase.co/storage/v1/object/public/profile-photos//default_profile.webp",
        },
      ]);

      if (profileError) throw profileError;

      router.push(`/check-email?email=${email}`); // Redirect to email check page
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error during signup. Please try again.");
      }
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-semibold text-center mb-6">
            Signup to ArgenticBlog
          </h1>

          {error && <p className="text-red-500 text-center">{error}</p>}

          <form onSubmit={handleSignup} className="space-y-4">
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
              <label className="block text-gray-300">Username:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
              Sign Up
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/login" className="text-blue-400 hover:underline">
              Login
            </Link>
            <span className="text-gray-400 mx-2">|</span>
            <Link href="/" className="text-blue-400 hover:underline">
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { FiMenu } from "react-icons/fi";
import { User } from "@supabase/supabase-js";
import Sidebar from "@/app/components/SideBar";
import { App } from "@capacitor/app";

export default function ChangePasswordPage() {
    const [email, setEmail] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (!error && data?.user) {
                setUser(data.user);
            }
        };
        fetchUser();
    }, []);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setLoading(true); // Start loading

        try {
            // Step 1: Sign in with old password
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password: oldPassword,
            });

            if (signInError) throw signInError;

            // Step 2: Update password
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (updateError) throw updateError;

            setMessage("Password changed successfully!");
            setTimeout(() => router.push("/login"), 2000);
        } catch (error: unknown) {
            if (error instanceof Error) {
                setMessage(error.message);
            } else {
                setMessage("Error changing password. Try again.");
            }
        } finally {
            setLoading(false); // Stop loading
        }
    };

    const handleBack = useCallback(() => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push("/");
        }
    }, [router]);

    useEffect(() => {
        const handleAndroidBack = () => {
            handleBack();
        };

        const setupListener = async () => {
            const listener = await App.addListener("backButton", handleAndroidBack);
            return () => {
                listener.remove();
            };
        };

        const cleanup = setupListener();

        return () => {
            cleanup.then((removeListener) => removeListener?.()).catch(console.error);
        };
    }, [handleBack]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen p-6">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} user={user} />
            {/* Header */}
            <header className="bg-gray-900 text-white p-4 shadow-md relative">
                <div className="container mx-auto flex justify-between items-center">
                    {/* Back Button */}
                    <button
                        onClick={handleBack}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                        ←
                    </button>

                    {/* Sidebar Toggle Button (Hidden when sidebar is open) */}
                    {!isSidebarOpen && (
                        <button
                            onClick={toggleSidebar}
                            className="p-2 bg-gray-800 rounded-md shadow-md z-50 relative"
                        >
                            <FiMenu size={24} />
                        </button>
                    )}
                </div>
            </header>
            <div className="flex items-center justify-center flex-grow mt-35">
                <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-lg">
                    <h1 className="text-2xl font-semibold mb-4 text-center">Change Password</h1>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Old Password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                            required
                        />
                        <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                            required
                        />
                        {message && <p className="text-red-400 text-sm">{message}</p>}
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded flex items-center justify-center"
                            disabled={loading}
                        >
                            {loading ? "Changing..." : "Update Password"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
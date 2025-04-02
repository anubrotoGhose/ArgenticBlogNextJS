"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { FiMenu } from "react-icons/fi";
import { App } from "@capacitor/app";
import Sidebar from "@/app/components/SideBar";

// Lazy-load Tiptap to avoid SSR issues
const TiptapEditor = dynamic(() => import("../components/TipTapEditor"), { ssr: false });



export default function PostBlog() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Fetch user details on page load
    useEffect(() => {
        async function getUser() {
            const { data, error } = await supabase.auth.getUser();
            if (error) {
                console.error("Error fetching user:", error.message);
                return;
            }
            setUser(data?.user ?? null);
        }
        getUser();
    }, []);

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

    // Handle Blog Post Submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !content) {
            setMessage("Title and Content are required!");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            // Get user profile details
            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("username, email")
                .eq("email", user?.email)
                .single();

            if (profileError || !profile) {
                setMessage("Error fetching user profile");
                setLoading(false);
                return;
            }

            // Insert new blog post
            const { error } = await supabase.from("articles").insert([
                {
                    title,
                    content,
                    email: profile.email,
                    username: profile.username,
                    PostTimeStamp: new Date().toISOString(),
                    commentidlist: [],
                    ratings: 0,
                    ratingsidlist: [],
                },
            ]);

            if (error) {
                setMessage("Error saving post. Please try again.");
                console.error("Insert error:", error.message);
            } else {
                setMessage("Post saved successfully!");
                setTitle("");
                setContent("");
                router.push(`/author?username=${profile.username}`);
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            setMessage("Something went wrong!");
        }

        setLoading(false);
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
            <div className="max-w-3xl mx-auto p-6">
                <h1 className="text-3xl font-bold mb-4">Create a New Blog Post</h1>

                {!user ? (
                    <p className="text-red-500">You must be logged in to post a blog.</p>
                ) : (
                    <form onSubmit={handleSubmit} className="w-full max-w-3xl bg-gray-800 p-6 rounded-lg shadow-md">
                        {/* Title Input */}
                        <input
                            type="text"
                            placeholder="Enter blog title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-2 mb-4 bg-gray-700 text-white border border-gray-600 rounded-md"
                        />

                        {/* Tiptap Editor */}
                        <TiptapEditor value={content} onChange={(value) => setContent(value)} />

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Post Blog"}
                        </button>

                        {/* Success/Error Message */}
                        {message && <p className="mt-3 text-center text-yellow-400">{message}</p>}
                    </form>
                )}
            </div>
        </div>
    );
}

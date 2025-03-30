"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase"; // Import Supabase client
import { Post } from "@/app/models/Post";
import Sidebar from "@/app/components/SideBar";
import { User } from "@supabase/supabase-js";
import { FiMenu } from "react-icons/fi";
import { App } from "@capacitor/app";
import { Suspense, useEffect, useState, useCallback } from "react";
import SearchBar from "@/app/components/SearchBar";

const stripHtmlTags = (html: string) => {
    return html
        .replace(/<br\s*\/?>/gi, "\n") // Replace <br> and <br/> with newline
        .replace(/<\/?[^>]+(>|$)/g, ""); // Remove all other HTML tags
};

function SearchPageContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get("query") || "";
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        if (!query) {
            setPosts([]);
            setLoading(false);
            return;
        }

        const fetchPosts = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("articles")
                .select("*")
                .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
                .order("PostTimeStamp", { ascending: false });

            if (error) {
                console.error("Error fetching posts:", error.message);
            } else {
                setPosts(data || []);
            }
            setLoading(false);
        };

        fetchPosts();
    }, [query]);

    useEffect(() => {
        const fetchUser = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (!error && data?.user) {
                setUser(data.user);
            }
        };
        fetchUser();
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

    return (
        <div className="bg-gray-900 text-white min-h-screen p-6">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} user={user} />
            <header className="bg-gray-800 p-6 text-center">
                <h1 className="text-3xl font-bold text-blue-400">Search Results</h1>
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

            <div className="flex justify-center mt-4">
                <SearchBar />
            </div>

            <div className="max-w-4xl mx-auto p-6">
                {loading ? (
                    <p className="text-center text-gray-400">Loading...</p>
                ) : posts.length > 0 ? (
                    <>
                        <h2 className="text-xl font-semibold text-gray-300">Results for &quot;{query}&quot;</h2>

                        <div className="mt-4 space-y-4">
                            {posts.map((post) => {
                                const cleanText = stripHtmlTags(post.content || "").slice(0, 200); // Strip tags and take first 200 chars
                                const previewContent = cleanText + (post.content && post.content.length > 200 ? "..." : "");

                                return (
                                    <div key={post.articleid} className="p-6 bg-gray-800 rounded-lg shadow-lg">
                                        <Link href={`/postdetail?post_id=${post.articleid}`} className="text-2xl font-bold text-blue-400 hover:underline">
                                            {post.title}
                                        </Link>
                                        <p className="text-gray-400 mt-1">
                                            Posted by <span className="font-semibold">{post.username}</span> on {post.PostTimeStamp}
                                        </p>
                                        <div className="text-gray-300 mt-2">{previewContent || "No content available"}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <p className="text-center text-gray-400 mt-6">No results found for &quot;{query}&quot;.</p>

                )}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<p className="text-blue-500">Loading post details...</p>}>
            <SearchPageContent />
        </Suspense>
    );
}
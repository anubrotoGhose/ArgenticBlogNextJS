"use client";

import { useSearchParams } from "next/navigation";
import {Suspense, useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { App } from "@capacitor/app";

interface Post {
    articleid: string;
    title: string;
    username: string;
    PostTimeStamp: string;
    content: string;
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Function to remove all HTML tags and return plain text
const stripHtmlTags = (html: string) => {
    return html
        .replace(/<br\s*\/?>/gi, "\n") // Replace <br> and <br/> with newline
        .replace(/<\/?[^>]+(>|$)/g, ""); // Remove all other HTML tags
};

function AuthorPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const username = searchParams.get("username");
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    const handleBack = useCallback(() => {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push("/");
        }
      }, [router]); // ✅ Dependencies: Only `router`
    
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

    useEffect(() => {
        const fetchPosts = async () => {
            if (!username) return;

            const { data, error } = await supabase
                .from("articles")
                .select("*")
                .eq("username", username);

            if (!error) {
                setPosts(data.map(post => ({ ...post, content: post.content || "" })));
            }
            setLoading(false);
        };

        fetchPosts();
    }, [username]);

    const handlePostNavigation = (articleid: string) => {
        router.push(`/postdetail?post_id=${articleid}`);
    };

    if (!username) return <p className="text-red-500">Invalid username</p>;
    if (loading) return <p className="text-blue-500">Loading...</p>;
    if (posts.length === 0) return <p className="text-red-500">No posts found</p>;

    return (
        <div className="bg-gray-900 text-white min-h-screen p-6">
            <header className="bg-gray-900 text-white p-4 shadow-md">
                <div className="container mx-auto">
                    {/* Back Button - Extreme Top Left */}
                    <button
                        onClick={handleBack}
                        className="absolute top-4 left-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                        ←
                    </button>
                </div>
            </header>

            <h1 className="text-3xl font-bold text-blue-500">Posts by {username}</h1>

            <div className="mt-4 space-y-4">
                {posts.map(post => {
                    const cleanText = stripHtmlTags(post.content || "").slice(0, 200); // Strip tags and take first 200 chars
                    const previewContent = cleanText + (post.content && post.content.length > 200 ? "..." : "");

                    return (
                        <div key={post.articleid} className="border border-gray-700 p-4 rounded">
                            <h2
                                className="text-xl font-bold text-blue-400 cursor-pointer hover:underline"
                                onClick={() => handlePostNavigation(post.articleid)}
                            >
                                {post.title}
                            </h2>
                            <p className="text-gray-500">Posted on {new Date(post.PostTimeStamp).toLocaleDateString()}</p>
                            <div className="text-gray-300 mt-2">{previewContent}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function AuthorPage() {
    return (
        <Suspense fallback={<p className="text-blue-500">Loading author details...</p>}>
            <AuthorPageContent />
        </Suspense>
    );
}
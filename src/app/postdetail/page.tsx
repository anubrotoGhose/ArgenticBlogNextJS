"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { App } from "@capacitor/app";
import DOMPurify from "dompurify";
import { supabase } from "@/lib/supabase";
import { FiMenu } from "react-icons/fi";
import Sidebar from "@/app/components/SideBar";
import { User } from "@supabase/supabase-js";
import { Post } from "@/app/models/Post";

function PostDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get("post_id");
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleAuthorNavigation = (username: string) => {
    router.push(`/author?username=${username}`);
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

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;

      const { data: post, error } = await supabase
        .from("articles")
        .select("*")
        .eq("articleid", postId)
        .single();

      if (!error && post) {
        setPost({ ...post, content: post.content || "" });
      }
      setLoading(false);
    };

    fetchPost();
  }, [postId]);

  if (!postId) return <p className="text-red-500">Invalid post ID</p>;
  if (loading) return <p className="text-blue-500">Loading...</p>;
  if (!post) return <p className="text-red-500">Post not found</p>;

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6 relative">
      {/* Sidebar */}
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

      {/* Post Content */}
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-blue-500">{post.title}</h1>
        <p className="text-gray-500">Posted on {new Date(post.PostTimeStamp).toLocaleDateString()}</p>
        <p className="text-gray-500">
          By{" "}
          <button
            onClick={() => handleAuthorNavigation(post.username)}
            className="text-blue-400 hover:underline hover:text-blue-500 bg-transparent border-none cursor-pointer"
          >
            {post.username}
          </button>
        </p>

        <div
          className="mt-4 text-gray-300"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content || "No Content Available") }}
        />
      </div>
    </div>
  );
}

export default function PostDetail() {
  return (
    <Suspense fallback={<p className="text-blue-500">Loading post details...</p>}>
      <PostDetailContent />
    </Suspense>
  );
}
"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { App } from "@capacitor/app";
import DOMPurify from "dompurify";

// Define a TypeScript interface for the post object
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

function PostDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get("post_id");
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const handleAuthorNavigation = (username: string) => {
    router.push(`/author?username=${username}`);
  };

  // ✅ Fix: Wrap `handleBack` in useCallback
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
  }, [handleBack]); // ✅ Now `handleBack` is stable

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
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      <header className="bg-gray-900 text-white p-4 shadow-md relative">
        <div className="container mx-auto">
          <button
            onClick={handleBack}
            className="absolute top-4 left-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            ←
          </button>
        </div>
      </header>

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
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
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

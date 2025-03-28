"use client"; // Needed for useSearchParams

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Define a TypeScript interface for the post object
interface Post {
  articleid: string;
  title: string;
  PostTimeStamp: string;
  content: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function PostDetailContent() {
  const searchParams = useSearchParams();
  const postId = searchParams.get("post_id"); // Get post_id from query params
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;

      const { data: post, error } = await supabase
        .from("articles")
        .select("*")
        .eq("articleid", postId)
        .single();

      if (!error) {
        setPost(post);
      }
      setLoading(false);
    };

    fetchPost();
  }, [postId]);

  if (!postId) return <p className="text-red-500">Invalid post ID</p>;
  if (loading) return <p className="text-blue-500">Loading...</p>;
  if (!post) return <p className="text-red-500">Post not found</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-500">{post.title}</h1>
      <p className="text-gray-500">Posted on {new Date(post.PostTimeStamp).toLocaleDateString()}</p>
      <div className="mt-4 text-gray-300">{post.content}</div>
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

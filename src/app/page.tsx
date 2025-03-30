"use client";

import BlogList from "./components/BlogList";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { FiMenu } from "react-icons/fi";
import { useEffect, useState } from "react";
import Sidebar from "@/app/components/SideBar";
import { Post } from "@/app/models/Post";

export default function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase.from("articles").select("*");
      if (error) {
        setError("Error loading posts...");
      } else {
        setPosts(data || []);
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

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
  if (loading) {
    return <p className="text-blue-500">Loading...</p>;
  }
  if (error) {
    return <p className="text-red-500">Error loading posts...</p>;
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6 relative">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} user={user} />
      <header className="bg-gray-900 text-white p-4 shadow-md relative">
        <div className="container mx-auto flex justify-between items-center">

          <div className="container mx-auto">
            <h1 className="text-xl font-semibold text-center">Argentic Blog</h1>
          </div>
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
      <div className="relative">

      </div>
      <br></br>
      <h1 className="text-4xl font-bold text-center text-blue-500">Latest Blog Posts</h1>
      <div>
        <BlogList posts={posts || []} />
      </div>
    </div>
  );
}

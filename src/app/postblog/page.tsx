    "use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Preferences } from "@capacitor/preferences";
import { useRouter } from "next/navigation";

export default function PostBlog() {
  const router = useRouter();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { value } = await Preferences.get({ key: "user_session" });
      if (value) {
        const session = JSON.parse(value);
        const email = session.user?.email;

        if (!email) return;

        // Fetch profile photo from Supabase
        const { data, error } = await supabase
          .from("profiles")
          .select("profile_photo")
          .eq("email", email)
          .single();

        if (data) setProfilePhoto(data.profile_photo);
        if (error) console.error("Error fetching profile photo:", error);
      }
    };

    fetchProfile();
  }, []);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      alert("Title and content cannot be empty.");
      return;
    }

    setLoading(true);

    const { value } = await Preferences.get({ key: "user_session" });
    if (!value) {
      alert("User not logged in.");
      return;
    }

    const session = JSON.parse(value);
    const email = session.user?.email;

    // Fetch username
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("username")
      .eq("email", email)
      .single();

    if (profileError) {
      console.error("Error fetching username:", profileError);
      setLoading(false);
      return;
    }

    const username = profile?.username;

    // Insert post into Supabase
    const { error } = await supabase.from("articles").insert([
      {
        title,
        content,
        email,
        username,
        PostTimeStamp: new Date().toISOString(),
        commentidlist: [],
        ratings: 0,
        ratingsidlist: [],
      },
    ]);

    setLoading(false);

    if (error) {
      console.error("Error saving post:", error);
      alert("Failed to save post.");
    } else {
      alert("Post saved successfully!");
      router.push("/"); // Redirect to homepage
    }
  };

  return (
    <div className="container mx-auto p-6">
      <header className="flex justify-between items-center border-b pb-4 mb-6">
        <h1 className="text-3xl font-bold">ArgenticBlog</h1>
        <div className="flex items-center space-x-4">
          <p>{new Date().toLocaleString()}</p>
          {profilePhoto && (
            <img
              src={`/${profilePhoto}`}
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
          )}
        </div>
      </header>

      <form onSubmit={handlePostSubmit} className="max-w-2xl mx-auto space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          placeholder="Write your post here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 border rounded h-40"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Posting..." : "Post Blog"}
        </button>
      </form>
    </div>
  );
}

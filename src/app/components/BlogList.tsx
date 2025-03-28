"use client"; // Required in Next.js App Router
import { useRouter } from "next/navigation";

// Define a TypeScript interface for the post object
interface Post {
  articleid: string;
  title: string;
  username: string;
  PostTimeStamp: string;
  content?: string; // Optional field
}

export default function BlogList({ posts }: { posts: Post[] }) {
  const router = useRouter();

  const handleNavigation = (articleid: string) => {
    router.push(`/postdetail?post_id=${articleid}`); // Correct string interpolation
  };

  return (
    <div className="max-w-4xl mx-auto">
      {posts.map((post) => (
        <div key={post.articleid} className="mb-6 p-4 bg-gray-700 rounded-lg shadow-md">
          {/* Button instead of Link, navigating to /postdetail with post_id as a query parameter */}
          <button
            onClick={() => handleNavigation(post.articleid)}
            className="text-xl text-blue-400 hover:underline hover:text-blue-500 bg-transparent border-none cursor-pointer"
          >
            {post.title}
          </button>
          <p className="text-sm text-gray-400">
            Posted by {post.username} on {new Date(post.PostTimeStamp).toLocaleDateString()}
          </p>
          <div className="text-gray-300 mt-2">
            {post.content ? post.content.slice(0, 200) : "No content available"}
            {post.content && post.content.length > 200 && "..."}
          </div>
        </div>
      ))}
    </div>
  );
}

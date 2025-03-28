"use client";
import { useRouter } from "next/navigation";

interface Post {
  articleid: string;
  title: string;
  username: string;
  PostTimeStamp: string;
  content?: string;
}

// Function to remove all HTML tags and return plain text
const stripHtmlTags = (html: string) => {
  return html
    .replace(/<br\s*\/?>/gi, "\n") // Replace <br> and <br/> with newline
    .replace(/<\/?[^>]+(>|$)/g, ""); // Remove all other HTML tags
};

export default function BlogList({ posts }: { posts: Post[] }) {
  const router = useRouter();

  const handleNavigation = (articleid: string) => {
    router.push(`/postdetail?post_id=${articleid}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {posts.map((post) => {
        const cleanText = stripHtmlTags(post.content || "").slice(0, 200); // Strip tags and take first 200 chars
        const previewContent = cleanText + (post.content && post.content.length > 200 ? "..." : "");

        return (
          <div key={post.articleid} className="mb-6 p-4 bg-gray-700 rounded-lg shadow-md">
            <button
              onClick={() => handleNavigation(post.articleid)}
              className="text-xl text-blue-400 hover:underline hover:text-blue-500 bg-transparent border-none cursor-pointer"
            >
              {post.title}
            </button>
            <p className="text-sm text-gray-400">
              Posted by {post.username} on {new Date(post.PostTimeStamp).toLocaleDateString()}
            </p>
            <div className="text-gray-300 mt-2">{previewContent || "No content available"}</div>
          </div>
        );
      })}
    </div>
  );
}

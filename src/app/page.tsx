import BlogList from "./components/BlogList";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default async function HomePage() {
  const { data: posts, error } = await supabase.from("articles").select("*");

  if (error) {
    return <p className="text-red-500">Error loading posts...</p>;
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6">
        <header className="bg-gray-900 text-white p-4 shadow-md">
          <div className="container mx-auto">
            <h1 className="text-xl font-semibold text-center">Argentic Blog</h1>
          </div>
        </header>
        <h1 className="text-4xl font-bold text-center text-blue-500">Latest Blog Posts</h1>
        <div>
          <BlogList posts={posts || []} />
        </div>
      </div>
    </div>
  );
}

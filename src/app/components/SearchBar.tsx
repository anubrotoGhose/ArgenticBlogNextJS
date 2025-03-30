"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?query=${query}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex justify-center w-full">
      <input
        type="text"
        name="query"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search posts..."
        className="px-4 py-3 w-1/2 rounded-l-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="px-4 py-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition"
      >
        Search
      </button>
    </form>
  );
}

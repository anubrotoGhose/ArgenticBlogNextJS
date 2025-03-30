"use client";

import { FiX } from "react-icons/fi";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  user: User | null;
}

export default function Sidebar({ isOpen, toggleSidebar, user }: SidebarProps) {

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout failed:", error.message);
      return;
    }
    window.location.href = "/";
  };


  return (
    <div
      className={`fixed top-0 right-0 h-full w-64 bg-gray-800 shadow-lg transition-transform z-40 ${isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
    >
      {/* Push Menu Title and Close Button Down */}
      <div className="p-6 mt-16 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-blue-500">Menu</h2>
        <button onClick={toggleSidebar} className="p-1 text-white">
          <FiX size={24} />
        </button>
      </div>

      {/* Sidebar Links (Fixed Position) */}
      <ul className="space-y-3 p-6">
        {user ? (
          <>
            <li>
              <Link
                href="/profile"
                className="block px-4 py-2 bg-blue-600 text-white rounded-md text-center hover:bg-blue-700"
              >
                Profile
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="block w-full px-4 py-2 bg-red-600 text-white rounded-md text-center hover:bg-red-700"
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <li>
            <Link
              href="/login"
              className="block px-4 py-2 bg-blue-600 text-white rounded-md text-center hover:bg-blue-700"
            >
              Login
            </Link>
          </li>
        )}
        <li>
          <Link
            href="/"
            className="block px-4 py-2 bg-gray-700 text-white rounded-md text-center hover:bg-gray-600"
          >
            Home
          </Link>
        </li>
      </ul>
    </div>
  );
}
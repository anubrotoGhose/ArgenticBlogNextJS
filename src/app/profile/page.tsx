"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { UserProfile } from "@/app/models/UserProfile";
import { App } from "@capacitor/app";

export default function ProfilePage() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [username, setUsername] = useState<string>("");
    const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
    const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>("https://pgpevfnwbddeankyqrhz.supabase.co/storage/v1/object/public/profile-photos//default_profile.webp");
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function fetchUser() {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) return;

            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("email", user.email)
                .single();

            if (error) {
                console.error("Error fetching user:", error.message);
            } else {
                setUser(data);
                setUsername(data?.username || "");
                setProfilePhotoUrl(data?.profile_photo || "https://pgpevfnwbddeankyqrhz.supabase.co/storage/v1/object/public/profile-photos//default_profile.web");
            }
        }
        fetchUser();
    }, []);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        if (!user) return;

        const updates: Partial<UserProfile> = { username };


        // Handle Profile Photo Upload
        if (profilePhoto) {
            const fileExt = profilePhoto.name.split(".").pop();
            const fileName = `profile_${username}.${fileExt}`;
            const filePath = `profile_photos/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("profile-photos")
                .upload(filePath, profilePhoto, { upsert: true });

            if (uploadError) {
                setMessage("Error uploading image: " + uploadError.message);
                return;
            }

            const { data } = supabase.storage
                .from("profile-photos")
                .getPublicUrl(filePath);
            updates.profile_photo = data.publicUrl;
        }

        // Update Supabase
        const { error } = await supabase
            .from("profiles")
            .update(updates)
            .eq("email", user.email);

        if (error) {
            setMessage("Error updating profile: " + error.message);
        } else {
            setMessage("Profile updated successfully!");
            setProfilePhotoUrl(updates.profile_photo || profilePhotoUrl);
        }
    };

    const handleAuthorNavigation = (username: string) => {
        router.push(`/author?username=${username}`);
    };

    const router = useRouter();

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

    const handleLogout = async () => {
        await supabase.auth.signOut(); // Logs the user out
        router.push("/"); // Redirects to home
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen p-6">
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
                </div>
            </header>
            <div className="flex items-center justify-center flex-grow mt-15">
                <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-lg">
                    {/* Profile Header */}
                    <div className="flex flex-col items-center mb-6">
                        <Image
                            //For now I am testing a few things
                            src={profilePhotoUrl}
                            alt="Profile Photo"
                            width={96}
                            height={96}
                            className="w-24 h-24 rounded-full border-4 border-blue-500 shadow-md"
                        />
                        <h1 className="text-xl font-semibold mt-4">{username || "Username"}</h1>
                    </div>

                    {/* Profile Form */}
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="block text-gray-300">Change Profile Photo:</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)}
                                className="w-full p-2 mt-1 rounded-md bg-gray-700 border border-gray-600 text-gray-300"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-300">Change Username:</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter new username"
                                className="w-full p-2 mt-1 rounded-md bg-gray-700 border border-gray-600 text-gray-300"
                            />
                        </div>

                        {message && <p className="text-red-400 text-sm mt-1">{message}</p>}

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition duration-200"
                        >
                            Update Profile
                        </button>
                    </form>

                    {/* Profile Links */}
                    <div className="mt-6 space-y-2 text-center">
                        <button
                            onClick={() => router.push("/change-password")}
                            className="block text-blue-400 hover:underline"
                        >
                            Change Password
                        </button>
                        <button
                            onClick={handleLogout}
                            className="block text-blue-400 hover:underline"
                        >
                            Logout
                        </button>
                        <button
                            onClick={() => router.push("/postblog")}
                            className="block text-blue-400 hover:underline"
                        >
                            Post an Article
                        </button>
                        <button
                            onClick={() => handleAuthorNavigation(username)}
                            className="block text-blue-400 hover:underline"
                        >
                            My Articles
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

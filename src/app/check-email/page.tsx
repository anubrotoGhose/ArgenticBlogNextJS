"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
function CheckEmailPageContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email");

    return (
        <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center p-6">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md text-center">
                <h1 className="text-2xl font-semibold mb-4">Check Your Email</h1>
                <p className="text-gray-300">
                    A confirmation email has been sent to{" "}
                    <span className="font-semibold text-blue-400">{email}</span>.
                </p>
                <p className="text-gray-300 mt-2">
                    Please check your inbox and follow the instructions to activate your account.
                </p>

                <div className="mt-6">
                    <p className="text-gray-400 text-sm">
                        Didn&apos;t receive the email? Check your spam folder or{" "}
                        <Link href="/signup" className="text-blue-400 hover:underline">
                            try signing up again
                        </Link>.
                    </p>
                </div>

                <div className="mt-4">
                    <Link href="/login" className="text-blue-400 hover:underline">
                        Go to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function CheckEmailPage() {
    return (
        <Suspense fallback={<p className="text-blue-500">Loading post details...</p>}>
            <CheckEmailPageContent />
        </Suspense>
    );
}
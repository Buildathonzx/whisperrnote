"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page where auth modal will handle signup
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Redirecting to WhisperNote...</h1>
        <p className="text-gray-600">Please use the new auth modal to create your account.</p>
      </div>
    </div>
  );
}

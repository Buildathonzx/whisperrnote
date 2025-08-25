"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { account, getCurrentUser, sendEmailVerification, completeEmailVerification } from "@/lib/appwrite";
import type { Users } from "@/types/appwrite-types";
import { motion } from "framer-motion";

function EmailVerifyInner() {
  const [user, setUser] = useState<Users | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams?.get("userId") || "";
  const secret = searchParams?.get("secret") || "";

  // Handle verification link (userId & secret)
  useEffect(() => {
    const handleVerificationLink = async () => {
      if (userId && secret) {
        setLoading(true);
        setError("");
        setMessage("");
        try {
          await completeEmailVerification(userId, secret);
          setMessage("Email verified successfully. Redirecting to notes...");
          setIsVerified(true);
          setTimeout(() => router.replace("/notes"), 1500);
        } catch (err: any) {
          setError(err?.message || "Failed to verify email");
        } finally {
          setLoading(false);
        }
      }
    };
    handleVerificationLink();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, secret, router]);

  // Get current user and check verification status
  useEffect(() => {
    account.get()
      .then(u => {
        setUser(u as unknown as Users);
        if (u.emailVerification) {
          setIsVerified(true);
          router.replace("/notes");
        }
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [router]);

  const handleSendVerification = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await sendEmailVerification(window.location.origin + "/verify");
      setEmailSent(true);
      setMessage("Verification email sent! Please check your inbox.");
    } catch (err: any) {
      setError(err?.message || "Failed to send verification email");
    } finally {
      setLoading(false);
    }
  };

  // If handling verification link, show loading/message
  if (userId && secret) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100"
      >
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="backdrop-blur-lg bg-white/80 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-purple-100 animate-fade-in"
        >
          <img src="/logo/whisperrnote.png" alt="WhisperrNote Logo" className="mx-auto mb-6 w-20 h-20 rounded-full shadow-lg" />
          <h2 className="text-3xl font-extrabold mb-2 text-center text-purple-700 tracking-tight">
            Verifying Email...
          </h2>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 text-red-500 text-center animate-shake"
            >
              {error}
            </motion.p>
          )}
          {message && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 text-green-600 text-center"
            >
              {message}
            </motion.p>
          )}
        </motion.div>
      </motion.div>
    );
  }

  // Otherwise, show send verification email UI
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100"
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="backdrop-blur-lg bg-white/80 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-purple-100 animate-fade-in"
      >
        <img src="/logo/whisperrnote.png" alt="WhisperrNote Logo" className="mx-auto mb-6 w-20 h-20 rounded-full shadow-lg" />
        <h2 className="text-3xl font-extrabold mb-2 text-center text-purple-700 tracking-tight">
          {user?.name ? `Welcome, ${user.name}` : "Verify Email"}
        </h2>
        <p className="mb-6 text-center text-gray-500">
          {isVerified
            ? "Your email is already verified. Redirecting to notes..."
            : emailSent
              ? "A verification email has been sent to your address. Please check your inbox and follow the instructions."
              : "Click the button below to send a verification email to your address."}
        </p>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-red-500 text-center animate-shake"
          >
            {error}
          </motion.p>
        )}
        {message && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-green-600 text-center"
          >
            {message}
          </motion.p>
        )}
        {!isVerified && !emailSent && (
          <form onSubmit={e => e.preventDefault()} className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleSendVerification}
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold shadow transition-all duration-200"
            >
              {loading ? "Sending..." : "Send Verification Email"}
            </motion.button>
          </form>
        )}
        <p className="mt-6 text-center text-gray-600">
          <a href="/login" className="text-purple-600 hover:underline">Back to Login</a>
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function EmailVerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmailVerifyInner />
    </Suspense>
  );
}

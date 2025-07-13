"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { account } from "@/lib/appwrite";
import { motion } from "framer-motion";

export default function PasswordResetPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const userId = searchParams?.get("userId") || "";
  const secret = searchParams?.get("secret") || "";

  const handleReset = async () => {
    if (!userId || !secret) {
      setError("Invalid reset link.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await account.updateRecovery(userId, secret, password);
      setMessage("Password reset successful. You can now log in.");
    } catch (err: any) {
      setError(err?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

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
        <h2 className="text-3xl font-extrabold mb-2 text-center text-purple-700 tracking-tight">Reset Password</h2>
        <p className="mb-6 text-center text-gray-500">Enter your new password below</p>
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
        <form onSubmit={e => e.preventDefault()} className="space-y-4">
          <motion.input
            whileFocus={{ borderColor: "#a78bfa" }}
            type="password"
            placeholder="New Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/90 placeholder-gray-400 transition"
            autoComplete="new-password"
          />
          <motion.input
            whileFocus={{ borderColor: "#a78bfa" }}
            type="password"
            placeholder="Confirm Password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/90 placeholder-gray-400 transition"
            autoComplete="new-password"
          />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold shadow transition-all duration-200"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </motion.button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          <a href="/login" className="text-purple-600 hover:underline">Back to Login</a>
        </p>
      </motion.div>
    </motion.div>
  );
}

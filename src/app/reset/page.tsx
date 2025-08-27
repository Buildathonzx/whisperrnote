"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { completePasswordReset } from "@/lib/appwrite";
import { motion } from "framer-motion";

// Extract the inner component that uses useSearchParams
function PasswordResetInner() {
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
      await completePasswordReset(userId, secret, password);
      setMessage("Password reset successful. You can now log in.");
    } catch (err: any) {
      setError(err?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="backdrop-blur-lg bg-light-card/95 dark:bg-dark-card/95 rounded-3xl shadow-3d-light dark:shadow-3d-dark border border-light-border/20 dark:border-dark-border/20 overflow-hidden">
          <div className="p-6">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img 
                src="/logo/whisperrnote.png" 
                alt="WhisperrNote Logo" 
                className="w-16 h-16 rounded-2xl shadow-card-light dark:shadow-card-dark" 
              />
            </div>
            
            {/* Header */}
            <h2 className="text-2xl font-bold text-center text-foreground mb-2">Reset Password</h2>
            <p className="text-center text-muted mb-6">Enter your new password below</p>
            
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-100/80 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl mb-4 shadow-inner-light dark:shadow-inner-dark"
              >
                {error}
              </motion.div>
            )}
            
            {/* Success Message */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-100/80 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl mb-4 shadow-inner-light dark:shadow-inner-dark"
              >
                {message}
              </motion.div>
            )}
            
            {/* Form */}
            <form onSubmit={e => e.preventDefault()} className="space-y-4">
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-xl bg-light-card dark:bg-dark-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all shadow-inner-light dark:shadow-inner-dark"
                autoComplete="new-password"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-xl bg-light-card dark:bg-dark-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all shadow-inner-light dark:shadow-inner-dark"
                autoComplete="new-password"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="w-full bg-accent hover:bg-accent-hover text-brown-darkest py-2 px-4 rounded-xl font-medium transition-colors shadow-3d-light dark:shadow-3d-dark disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </motion.button>
            </form>
            
            {/* Back Link */}
            <p className="mt-6 text-center">
              <a href="/" className="text-accent hover:text-accent-hover transition-colors font-medium">
                Back to Home
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function PasswordResetPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PasswordResetInner />
    </Suspense>
  );
}

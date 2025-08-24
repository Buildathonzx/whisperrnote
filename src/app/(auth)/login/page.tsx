"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginEmailPassword, getCurrentUser } from "@/lib/appwrite";
import { useAuth } from "@/components/ui/AuthContext";
import { useLoading } from "@/components/ui/LoadingContext";
import { motion } from "framer-motion";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { login: authLogin, refreshUser } = useAuth();
  const { showLoading, hideLoading } = useLoading();

  const login = async (email: string, password: string) => {
    setError("");
    showLoading("Signing you in...");
    try {
      await loginEmailPassword(email, password);
      const user = await getCurrentUser();
      if (user) {
        authLogin(user);
        await refreshUser();
        // Router navigation will be handled by RouteGuard
      }
    } catch (err: any) {
      setError(err?.message || "Login failed");
      hideLoading();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      login(email, password);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 p-4"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="backdrop-blur-lg bg-white/80 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-purple-100"
      >
        <div className="text-center mb-8">
          <img 
            src="/logo/whisperrnote.png" 
            alt="WhisperNote Logo" 
            className="mx-auto mb-4 w-16 h-16 rounded-full shadow-md" 
          />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your WhisperNote account</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              placeholder="Enter your password"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold shadow-lg transition-all duration-200"
          >
            Sign In
          </motion.button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <Link 
            href="/reset" 
            className="text-sm text-purple-600 hover:text-purple-800 transition-colors"
          >
            Forgot your password?
          </Link>
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link 
              href="/signup" 
              className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signupEmailPassword, loginEmailPassword, getCurrentUser } from "@/lib/appwrite";
import type { Users } from "@/types/appwrite.d";
import { motion } from "framer-motion";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    getCurrentUser().then(user => {
      if (user) router.replace("/notes");
    });
  }, [router]);

  const register = async () => {
    setError("");
    try {
      await signupEmailPassword(email, password, name);
      await loginEmailPassword(email, password);
      router.push("/notes");
    } catch (err: any) {
      setError(err?.message || "Registration failed");
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
        <h2 className="text-3xl font-extrabold mb-2 text-center text-purple-700 tracking-tight">Create Account</h2>
        <p className="mb-6 text-center text-gray-500">Sign up to get started</p>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-red-500 text-center animate-shake"
          >
            {error}
          </motion.p>
        )}
        <form onSubmit={e => e.preventDefault()} className="space-y-4">
          <motion.input
            whileFocus={{ borderColor: "#a78bfa" }}
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/90 placeholder-gray-400 transition"
            autoComplete="email"
          />
          <motion.input
            whileFocus={{ borderColor: "#a78bfa" }}
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/90 placeholder-gray-400 transition"
            autoComplete="new-password"
          />
          <motion.input
            whileFocus={{ borderColor: "#a78bfa" }}
            type="text"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/90 placeholder-gray-400 transition"
            autoComplete="name"
          />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={register}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold shadow transition-all duration-200"
          >
            Register
          </motion.button>
        </form>
        <div className="flex justify-between items-center mt-2 mb-6">
          <a href="/reset" className="text-sm text-purple-600 hover:underline">Forgot password?</a>
        </div>
        <p className="mt-6 text-center text-gray-600">
          Already have an account? <a href="/login" className="text-purple-600 hover:underline">Login</a>
        </p>
      </motion.div>
    </motion.div>
  );
}

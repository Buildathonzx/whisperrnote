"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { account, ID } from "@/lib/appwrite";

export default function LoginPage() {
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const login = async (email: string, password: string) => {
    setError("");
    try {
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      setLoggedInUser(user);
      router.push("/notes");
    } catch (err: any) {
      setError(err?.message || "Login failed");
    }
  };

  const register = async () => {
    setError("");
    try {
      await account.create(ID.unique(), email, password, name);
      await login(email, password);
    } catch (err: any) {
      setError(err?.message || "Registration failed");
    }
  };

  const logout = async () => {
    await account.deleteSession("current");
    setLoggedInUser(null);
  };

  if (loggedInUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
        <div className="backdrop-blur-lg bg-white/70 rounded-2xl shadow-2xl p-8 w-full max-w-md text-center border border-purple-100 animate-fade-in">
          <img src="/logo/whisperrnote.png" alt="WhisperrNote Logo" className="mx-auto mb-4 w-16 h-16 rounded-full shadow-md" />
          <p className="mb-4 text-lg font-semibold text-gray-700">Logged in as {loggedInUser?.name || loggedInUser?.email}</p>
          <button type="button" onClick={logout} className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold shadow transition-all duration-200">Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="backdrop-blur-lg bg-white/70 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-purple-100 animate-fade-in">
        <img src="/logo/whisperrnote.png" alt="WhisperrNote Logo" className="mx-auto mb-6 w-20 h-20 rounded-full shadow-lg" />
        <h2 className="text-3xl font-extrabold mb-2 text-center text-purple-700 tracking-tight">Welcome Back</h2>
        <p className="mb-6 text-center text-gray-500">Sign in to your account</p>
        {error && <p className="mb-4 text-red-500 text-center animate-shake">{error}</p>}
        <form onSubmit={e => e.preventDefault()} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/80 placeholder-gray-400 transition"
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/80 placeholder-gray-400 transition"
            autoComplete="current-password"
          />
          <button type="button" onClick={() => login(email, password)} className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold shadow transition-all duration-200">Login</button>
        </form>
        <div className="my-6 flex items-center">
          <div className="flex-grow h-px bg-gray-200" />
          <span className="mx-4 text-gray-400 text-xs">or</span>
          <div className="flex-grow h-px bg-gray-200" />
        </div>
        <button disabled className="w-full py-2 px-4 bg-gray-100 text-gray-400 rounded-xl font-semibold shadow cursor-not-allowed">Continue with Google (coming soon)</button>
        <p className="mt-6 text-center text-gray-600">
          Don&apos;t have an account? <a href="/signup" className="text-purple-600 hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  );
}

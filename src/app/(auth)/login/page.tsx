"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { account, ID } from "@/lib/appwrite";

export default function LoginPage() {
  const [loggedInUser, setLoggedInUser] = useState(null);
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
      <div>
        <p>Logged in as {loggedInUser.name}</p>
        <button type="button" onClick={logout}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 32 }}>
      <h2>Login or Register</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={e => e.preventDefault()}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />
        <input
          type="text"
          placeholder="Name (for registration)"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => login(email, password)}>
            Login
          </button>
          <button type="button" onClick={register}>
            Register
          </button>
        </div>
      </form>
    </div>
  );
}

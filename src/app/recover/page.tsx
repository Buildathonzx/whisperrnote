"use client";
import { useState } from "react";
import { createRecovery } from "@/lib/auth";

export default function PasswordRecoveryPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRecovery = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await createRecovery(email, window.location.origin + "/reset");
      setMessage("Recovery email sent. Please check your inbox.");
    } catch (err: any) {
      setError(err?.message || "Failed to send recovery email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Password Recovery</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <button onClick={handleRecovery} disabled={loading}>
        {loading ? "Sending..." : "Send Recovery Email"}
      </button>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

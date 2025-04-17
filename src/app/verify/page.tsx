"use client";
import { useEffect, useState } from "react";
import { completeVerification } from "@/lib/auth";

export default function EmailVerificationPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("userId") || "";
    const secret = urlParams.get("secret") || "";
    if (userId && secret) {
      completeVerification(userId, secret)
        .then(() => setMessage("Email verified successfully! You can now log in."))
        .catch((err: any) => setError(err?.message || "Verification failed"))
        .finally(() => setLoading(false));
    } else {
      setError("Invalid verification link.");
      setLoading(false);
    }
  }, []);

  return (
    <div>
      <h2>Email Verification</h2>
      {loading && <p>Verifying...</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

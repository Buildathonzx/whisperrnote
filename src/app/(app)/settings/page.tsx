"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    account.get()
      .then((u) => {
        setUser(u);
        setName(u.name || "");
        setEmail(u.email || "");
      })
      .catch(() => {
        router.replace("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await account.updateName(name);
      setSuccess("Profile updated successfully.");
    } catch (err: any) {
      setError(err?.message || "Failed to update profile");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: 32 }}>
      <h2>Account Settings</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <form onSubmit={handleUpdate}>
        <div style={{ marginBottom: 16 }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            disabled
            style={{ width: "100%", marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ width: "100%", marginTop: 4 }}
          />
        </div>
        <button type="submit" style={{ width: "100%" }}>Update Profile</button>
      </form>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container">
      <h1>WhisperNote</h1>
      <p>Welcome to WhisperNote! Please login or signup.</p>
      <div>
        <Link href="/login">Login</Link> | <Link href="/signup">Signup</Link>
      </div>
    </div>
  );
}

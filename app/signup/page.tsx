"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      const message = error.message.toLowerCase();

      if (message.includes("rate limit")) {
        setError(
          "Too many attempts. Please wait a little and try again."
        );
        return;
      }

      if (message.includes("already registered")) {
        setError(
          "This email is already registered. Please login instead."
        );
        return;
      }

      setError(error.message);
      return;
    }

    router.push("/login");
    router.refresh();
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>

        {/* BRAND */}
        <div style={styles.brand}>
          <span style={styles.logo}>✦</span>
          <span>AI Research Lab</span>
        </div>

        {/* TITLE */}
        <h1 style={styles.title}>Create Account</h1>

        <p style={styles.subtitle}>
          Create your account using your email and password.
        </p>

        {/* FORM */}
        <form onSubmit={handleSignup} style={styles.form}>

          {/* EMAIL */}
          <label style={styles.label}>
            Email

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              style={styles.input}
            />
          </label>

          {/* PASSWORD */}
          <label style={styles.label}>
            Password

            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              style={styles.input}
            />
          </label>

          {/* CREATE ACCOUNT */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* ERROR */}
        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {/* LOGIN */}
        <button
          type="button"
          onClick={() => router.push("/login")}
          style={styles.loginButton}
        >
          Already have an account? Login
        </button>

        {/* FOOTER BRANDING */}
        <div style={styles.footer}>
          <div>Developer · Prakash Moond</div>
          <div>Team · TechTitans</div>
        </div>

      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: "24px",
    background: "#f5f7f9",
  },

  card: {
    width: "100%",
    maxWidth: "430px",
    padding: "32px",
    boxSizing: "border-box" as const,
    background: "#ffffff",
    border: "1px solid #e1e5ea",
    borderRadius: "20px",
    boxShadow: "0 18px 50px rgba(0, 0, 0, 0.07)",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "18px",
    fontWeight: 800,
    marginBottom: "30px",
    color: "#111827",
  },

  logo: {
    fontSize: "23px",
    lineHeight: 1,
  },

  title: {
    margin: "0",
    fontSize: "28px",
    fontWeight: 800,
    color: "#111827",
  },

  subtitle: {
    marginTop: "9px",
    marginBottom: "26px",
    color: "#667085",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  form: {
    display: "grid",
    gap: "17px",
  },

  label: {
    display: "grid",
    gap: "7px",
    color: "#344054",
    fontSize: "13px",
    fontWeight: 600,
  },

  input: {
    width: "100%",
    boxSizing: "border-box" as const,
    padding: "13px 14px",
    border: "1px solid #d0d5dd",
    borderRadius: "10px",
    outline: "none",
    fontSize: "14px",
    color: "#111827",
    background: "#ffffff",
  },

  button: {
    marginTop: "3px",
    width: "100%",
    padding: "13px 16px",
    border: "none",
    borderRadius: "10px",
    background: "#111827",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },

  error: {
    marginTop: "17px",
    padding: "11px 12px",
    borderRadius: "9px",
    background: "#fef3f2",
    border: "1px solid #fecdca",
    color: "#b42318",
    fontSize: "13px",
    lineHeight: 1.4,
  },

  loginButton: {
    width: "100%",
    marginTop: "17px",
    padding: "10px",
    border: "none",
    background: "transparent",
    color: "#475467",
    fontSize: "13px",
    cursor: "pointer",
  },

  footer: {
    marginTop: "24px",
    paddingTop: "18px",
    borderTop: "1px solid #edf0f2",
    color: "#98a2b3",
    fontSize: "10px",
    lineHeight: 1.8,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    textAlign: "center" as const,
  },
};
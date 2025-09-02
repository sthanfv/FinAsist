"use client";
import { AuthPanel } from "@/components/auth/AuthPanel";

export default function LoginPage() {
  return (
    <main>
      <AuthPanel initialMode="login" />
    </main>
  );
}

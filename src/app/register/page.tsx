"use client";
import { AuthPanel } from "@/components/auth/AuthPanel";

export default function RegisterPage() {
  return (
    <main>
      <AuthPanel initialMode="register" />
    </main>
  );
}

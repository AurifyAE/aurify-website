import type { Metadata } from "next";
import LoginForm from "@/components/tutorial/LoginForm";

export const metadata: Metadata = { title: "Admin sign in" };

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-2xl font-medium">Tutorial admin</h1>
      <LoginForm scope="admin" />
    </main>
  );
}

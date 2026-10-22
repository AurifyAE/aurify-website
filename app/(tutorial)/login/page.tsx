import type { Metadata } from "next";
import LoginForm from "@/components/tutorial/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string }>;
}) {
  const { expired } = await searchParams;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-2xl font-medium">Client tutorial</h1>
      {expired === "1" && (
        <p role="alert" className="max-w-sm rounded-xl bg-white/10 px-4 py-3 text-center text-sm">
          Your access has ended. Contact us to renew.
        </p>
      )}
      <LoginForm scope="viewer" />
    </main>
  );
}

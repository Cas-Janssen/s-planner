import { SignUpForm } from "@/components/auth/signup-form";
import { getServerSession } from "@/lib/auth/get-session";
import { redirect } from "next/navigation";

export default async function SignupPage() {
  const session = await getServerSession();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <SignUpForm />
    </main>
  );
}

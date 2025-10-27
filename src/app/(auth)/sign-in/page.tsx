import { SignInForm } from "@/components/auth/signin-form";
import { getServerSession } from "@/lib/auth/get-session";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getServerSession();
  if (session?.user) {
    redirect("/dashboard");
  }
  return (
    <main className="flex grow items-center justify-center px-4">
      <SignInForm />
    </main>
  );
}

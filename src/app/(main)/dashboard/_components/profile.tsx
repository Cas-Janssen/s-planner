import { getServerSession } from "@/lib/auth/get-session";
import { redirect } from "next/navigation";
import { EditableProfile } from "./editable-profile";

export async function UserProfile() {
  const session = await getServerSession();
  if (!session?.user) {
    redirect("/sign-in");
  }
  const { name, email, image } = session.user;

  return (
    <EditableProfile
      user={{
        name,
        email,
        image: image || null,
      }}
    />
  );
}

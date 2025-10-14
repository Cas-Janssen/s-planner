import { getServerSession } from "@/lib/get-session";
import { unauthorized } from "next/navigation";

export default async function UserProfile() {
  const session = await getServerSession();
  if (!session?.user) unauthorized();
  return (
    <div>
      <h1>Your profile</h1>
      <p>Welcome, {session.user.name}!</p>
      <p>Your email is: {session.user.email}</p>
      {session.user.image !== undefined && session.user.image !== null && (
        <img
          src={session.user.image}
          alt="User Avatar"
          width={100}
          height={100}
        />
      )}
    </div>
  );
}

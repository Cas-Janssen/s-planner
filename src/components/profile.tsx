import { getServerSession } from "@/lib/get-session";
import Image from "next/image";

export default async function UserProfile() {
  const session = await getServerSession();
  return (
    <div>
      <h1>Your profile</h1>
      <p>Welcome, {session?.user.name}!</p>
      <p>Your email is: {session?.user.email}</p>
      {session?.user.image !== undefined && session?.user.image !== null && (
        <Image
          src={session!.user.image}
          alt="User Avatar"
          width={100}
          height={100}
        />
      )}
    </div>
  );
}

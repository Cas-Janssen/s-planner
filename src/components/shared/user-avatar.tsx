import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function stringToColor(str: string) {
  const colors = [
    "bg-indigo-600",
    "bg-rose-600",
    "bg-green-600",
    "bg-yellow-500",
    "bg-pink-500",
    "bg-blue-600",
    "bg-purple-600",
    "bg-teal-500",
    "bg-orange-500",
    "bg-red-600",
    "bg-emerald-500",
    "bg-cyan-500",
    "bg-fuchsia-600",
    "bg-lime-500",
    "bg-violet-600",
  ];

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

export default function UserAvatar({
  name,
  imageURL,
}: {
  name: string;
  imageURL: string | null;
}) {
  const initial = name.charAt(0).toUpperCase() || "U";

  return (
    <Avatar className="h-10 w-10 ">
      {imageURL ? <AvatarImage src={imageURL} alt={name} /> : null}
      <AvatarFallback className={`${stringToColor(name)} text-white`}>
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}

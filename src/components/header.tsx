import Link from "next/link";
import Image from "next/image";
import logo from "#/public/globe.svg";

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4 bg-blue-600 text-white">
      <Link href="/">
        <Image src={logo} alt="Logo" width={50} height={50} />
      </Link>
      <nav className="flex gap-4">
        <Link className="hover:underline" href="/">
          Home
        </Link>
        <Link className="hover:underline" href="/user">
          Account
        </Link>
        <Link className="hover:underline" href="/boards">
          Boards
        </Link>
      </nav>
    </header>
  );
}

import Link from "next/link";
import styles from "./header.module.css";
import Image from "next/image";
import logo from "@/public/globe.svg";

export default function Header() {
  return (
    <header className={styles.header}>
      <Link href="/">
        <Image src={logo} alt="Logo" width={50} height={50} />
      </Link>
      <nav className={styles.nav}>
        <Link className={styles.navLink} href="/">
          Home
        </Link>
        <Link className={styles.navLink} href="/account">
          Account
        </Link>
        <Link className={styles.navLink} href="/about">
          About
        </Link>
      </nav>
    </header>
  );
}

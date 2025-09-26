import styles from "./page.module.css";

export default function Home() {
  return (
    <main>
      <h1 className={styles.title}>Welcome to Next.js!</h1>
      <p className={styles.description}>This is the home page.</p>
    </main>
  );
}

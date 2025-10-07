import styles from "./page.module.css";

export default function Home() {
  return (
    <main>
      <h1 className={styles.title}>Welcome to the trello clone!</h1>
      <p className={styles.description}>
        The ultimate project management tool for students
      </p>
    </main>
  );
}

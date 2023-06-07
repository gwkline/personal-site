import Image from 'next/image'
import Link from 'next/link'
import styles from '../page.module.css'

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <Link
          href="/"
          rel="noopener noreferrer"
        >
          <p>
            A summary of my&nbsp;
            <code className={styles.code}>work and interests.</code>
          </p>
        </Link>
        <div>
          By Gavin Kline
        </div>
      </div>

      <div className={styles.center}>
        <Image
          className={styles.logo}
          src="/kline_logo_black.png"
          alt="Kline Logo"
          width={180}
          height={65}
          priority
        />
      </div>

      <div className={styles.grid}>
        <h2 className={styles.lard}>
        </h2>
        <Link
          href="/experience"
          className={styles.card}
          rel="noopener noreferrer"
        >
          <h2>
            Experience <span>-&gt;</span>
          </h2>
          <p>My resume, but more fun to look at.</p>
        </Link>
        <h2 className={styles.lard}>
        </h2>
        <h2 className={styles.lard}>
        </h2>

      </div>
    </main>
  )
}

"use client";
import { useState } from 'react';
import Image from 'next/image'
import Link from 'next/link'
import styles from './page.module.css'

export default function Home() {
  const [selectedCard, setSelectedCard] = useState(null);

  const handleCardClick = (cardName) => {
    setSelectedCard(cardName);
  };

  return (
    <main className={styles.main}>
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

      {/* <div className={styles.description}>
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
      </div> */}



      <div className={styles.grid}>
        <div
          onClick={() => handleCardClick('about')}
          className={styles.card}
          rel="noopener noreferrer"
        >
          <h2>
            About <span>-&gt;</span>
          </h2>
          <p>Learn more about my background and what led me to this point.</p>
        </div>
        <div
          onClick={() => handleCardClick('experience')}
          className={styles.card}
          rel="noopener noreferrer"
        >
          <h2>
            Experience <span>-&gt;</span>
          </h2>
          <p>My resume, but more fun to look at.</p>
        </div>
        <div
          onClick={() => handleCardClick('projects')}
          className={styles.card}
          rel="noopener noreferrer">
          <h2>
            Projects <span>-&gt;</span>
          </h2>
          <p>
            My notable projects, including a few that I&apos;m particularly proud of.
          </p>
        </div>
        <div
          onClick={() => handleCardClick('skills')}
          className={styles.card}
          rel="noopener noreferrer"
        >
          <h2>
            Skills <span>-&gt;</span>
          </h2>
          <p>See what I excel at (with proof that I&apos;m not making things up).</p>
        </div>
      </div>

      {selectedCard === 'about' && <div>About section content...</div>}
      {selectedCard === 'projects' && <div>Projects section content...</div>}
      {selectedCard === 'experience' && <div>Experience section content...</div>}
      {selectedCard === 'skills' && <div>Skills section content...</div>}
    </main>
  )
}
import { Button } from "../../components";
import styles from "./DesignPage.module.css";

const MENU = [
  "Playlists",
  "Clinicians",
  "Information",
  "Rituals",
  "Resources",
  "Contact",
];

const FEATURES = {
  "Dual-Session Pairing": [
    "QR Sync (WebSocket Connect)",
    "Patient PWA Launch",
    "Session Timer Start",
    "Status Monitor (Ready)",
  ],
  "Clinical Safety": [
    "Real-Time Panic Alert",
    "Dynamic Routing (Auto)",
    "Noise Gate Adjustment",
    "Pedal/Gesture Input",
  ],
};

/** The designer's Figma landing page, phone first. It needs no login and no
 *  .env file, so the designer can run it on their own computer. */
export default function DesignPage() {
  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <Button variant="ghost" className={styles.small}>
          Get started
        </Button>
        <p className={styles.logo}>
          <b>Den</b>tify
        </p>
        <svg className={styles.art} viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="49.5" fill="none" stroke="#f7f7f7" />
          <circle cx="50" cy="50" r="42.1" fill="#f7f7f7" />
          <image
            href="/design/doctor.webp"
            x="14"
            y="14"
            width="72"
            height="72"
          />
          <path
            d="M92.43 24.51A49.5 49.5 0 1 0 10.47 79.79"
            fill="none"
            stroke="#9995ff"
          />
          <circle cx="10.47" cy="79.79" r="2.6" fill="#9995ff" />
        </svg>
        <h1 className={styles.title}>
          Total focus,
          <br />
          hands-free
        </h1>
      </header>

      <p className={styles.lead}>
        Sync music tempo to your procedure and control playback with subtle head
        gestures.
      </p>

      <ul className={styles.songs}>
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i}>
            <span className={styles.cover} />
            <span className={styles.song}>
              song
              <br />
              artist
            </span>
            <Button size="sm" className={styles.play}>
              play
            </Button>
          </li>
        ))}
      </ul>

      <section className={styles.mission}>
        <h2 className={styles.heading}>Our Mission</h2>
        <p>
          &quot;We bridge the gap between clinical precision and patient
          comfort. Dentify creates a synchronized, stress-free environment by
          blending a sterile, focused audio track for the dentist with a
          calming, immersive soundscape for the patient. We transform a
          potentially anxious procedure into a relaxed experience, ensuring
          perfect harmony between all participants in the treatment room.&quot;
        </p>
      </section>

      <section>
        <h2 className={styles.heading}>Shop</h2>
        <ul className={styles.shop}>
          {Array.from({ length: 12 }, (_, i) => (
            <li key={i} />
          ))}
        </ul>
      </section>

      <section>
        <h2 className={styles.heading}>Dual-Session Pairing</h2>
        <div className={styles.features}>
          {Object.entries(FEATURES).map(([title, items]) => (
            <div key={title}>
              <h3>{title}</h3>
              <ul>
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <p className={styles.label}>ENTIFY CLINIC</p>
        <nav>
          {MENU.map((item) => (
            <Button key={item} variant="ghost" className={styles.menuItem}>
              {item}
            </Button>
          ))}
        </nav>
        <p className={styles.email}>support@dentify.io</p>
        <p className={styles.brand}>DENTIFY</p>
      </footer>
    </main>
  );
}

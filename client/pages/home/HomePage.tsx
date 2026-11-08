import { Link } from "react-router";
import { Card } from "../../components";
import sky from "../../styles/sky.module.css";
import styles from "./HomePage.module.css";

const PARTS = [
  {
    to: "/tic-tac-toe",
    title: "Tic-tac-toe",
    text: "Four in a row on a 4×4 night sky. The server replays every game before it saves it.",
  },
  {
    to: "/nasa",
    title: "Space pictures",
    text: "Random pictures from NASA, explained in Hebrew by Gemini, and saved so nobody pays twice.",
  },
  {
    to: "/design",
    title: "Design",
    text: "Dentify, my designer partner's Figma landing page, built for phones and desktops.",
  },
];

export default function HomePage() {
  return (
    <main className={sky.sky}>
      <h1>Best space website</h1>
      <p>Three small apps on one starter kit.</p>
      <ul className={styles.parts}>
        {PARTS.map((part) => (
          <li key={part.to}>
            <Card>
              <h2 className={styles.title}>{part.title}</h2>
              <p className={styles.text}>{part.text}</p>
              <Link to={part.to}>Open it →</Link>
            </Card>
          </li>
        ))}
      </ul>
    </main>
  );
}

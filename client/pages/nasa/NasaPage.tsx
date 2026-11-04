import type { Picture } from "@shared/schemas/nasa";
import { useRef, useState, type CSSProperties } from "react";
import { Button, Card, Spinner } from "../../components";
import { useExplain, usePictures } from "../../features/nasa/hooks";
import { LANG } from "../../lib/config";
import { cx } from "../../lib/cx";
import sky from "../../styles/sky.module.css";
import styles from "./NasaPage.module.css";

/**
 * Where each picture floats on a wide screen: x and y in %, and its size
 * (a scale of the full card's image). Below 50% y, cards open upwards.
 */
const SKY = [
  [12, 22, 0.69],
  [31, 12, 0.5],
  [50, 28, 0.81],
  [70, 14, 0.56],
  [88, 24, 0.62],
  [20, 72, 0.56],
  [39, 84, 0.75],
  [58, 68, 0.5],
  [77, 82, 0.69],
  [92, 66, 0.53],
] as const;

/** Random pictures from NASA, explained in Hebrew by Gemini on request. */
export default function NasaPage() {
  const picturesQuery = usePictures();

  return (
    <main className={cx(sky.sky, styles.page)}>
      <header className={styles.header}>
        <div>
          <h1>Space pictures</h1>
          <p className={styles.muted}>
            Random pictures from NASA&apos;s Astronomy Picture of the Day.
          </p>
        </div>
        <Button
          variant="secondary"
          loading={picturesQuery.isFetching}
          onClick={() => void picturesQuery.refetch()}
        >
          New pictures
        </Button>
      </header>

      {picturesQuery.isPending ? (
        <div className={styles.centered}>
          <Spinner size="lg" label="Loading pictures" />
          <p className={styles.muted}>Asking NASA for pictures...</p>
        </div>
      ) : picturesQuery.isError ? (
        <Card padding="lg">
          <p role="alert">
            Could not load the pictures. {picturesQuery.error.message}
          </p>
        </Card>
      ) : picturesQuery.data.length === 0 ? (
        <Card padding="lg">
          <p className={styles.muted}>
            NASA sent only videos this time. Try new pictures.
          </p>
        </Card>
      ) : (
        <ul className={styles.grid}>
          {picturesQuery.data.map((picture, i) => {
            const [x, y, scale] = SKY[i % SKY.length];
            return (
              <li
                key={picture.date}
                className={cx(y > 50 && styles.lower)}
                style={
                  {
                    "--x": `${x}%`,
                    "--y": `${y}%`,
                    "--scale": scale,
                    "--delay": `${-i}s`,
                  } as CSSProperties
                }
              >
                <PictureCard picture={picture} />
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

function PictureCard({ picture }: { picture: Picture }) {
  const explain = useExplain();
  const [inHebrew, setInHebrew] = useState(false);
  const hebrew = inHebrew ? explain.data : undefined;
  const textRef = useRef<HTMLParagraphElement>(null);
  // The text's full height while it is open, so it can slide open to it.
  const [openHeight, setOpenHeight] = useState<number | null>(null);
  const date = new Intl.DateTimeFormat(hebrew ? "he" : LANG, {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(picture.date));

  return (
    <Card padding="none" className={styles.card}>
      <img
        src={picture.url}
        alt={picture.title}
        loading="lazy"
        className={styles.image}
      />
      {/* In Hebrew, the whole card is Hebrew, like a translation. */}
      <div
        className={styles.body}
        lang={hebrew ? "he" : undefined}
        dir={hebrew ? "rtl" : undefined}
      >
        <h2 className={styles.title}>{hebrew?.title_he ?? picture.title}</h2>
        <p className={styles.muted}>{date}</p>
        {picture.credit ? (
          <p className={styles.credit} lang="en" dir="ltr">
            {picture.credit}
          </p>
        ) : null}

        {hebrew ? (
          <>
            <p className={styles.summary}>{hebrew.summary_he}</p>
            <ul className={styles.tags}>
              {hebrew.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <p
              ref={textRef}
              className={cx(styles.explanation, !openHeight && styles.closed)}
              style={openHeight ? { maxBlockSize: openHeight } : undefined}
            >
              {picture.explanation}
            </p>
            <Button
              variant="ghost"
              size="sm"
              aria-expanded={Boolean(openHeight)}
              onClick={() =>
                setOpenHeight(
                  openHeight ? null : (textRef.current?.scrollHeight ?? null),
                )
              }
            >
              {openHeight ? "Show less" : "Read more"}
              <ChevronIcon up={Boolean(openHeight)} />
            </Button>
          </>
        )}

        <div className={styles.explain}>
          <Button
            loading={explain.isPending}
            onClick={() =>
              // Gemini is asked once. After that it only switches language.
              explain.data
                ? setInHebrew(!inHebrew)
                : explain.mutate(picture.date, {
                    onSuccess: () => setInHebrew(true),
                  })
            }
          >
            {explain.isPending
              ? "Gemini is thinking..."
              : inHebrew
                ? "Back to English"
                : "Explain in Hebrew"}
          </Button>
          {explain.isError ? (
            <p role="alert" className={styles.error}>
              {explain.error.message}
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function ChevronIcon({ up }: { up: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      width="16"
      height="16"
      aria-hidden="true"
      className={cx(styles.chevron, up && styles.flipped)}
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

import { z } from "zod";

/** One APOD picture, as our API sends it. All text is plain text. */
export type Picture = {
  date: string;
  title: string;
  explanation: string;
  /** A resized copy of the image. */
  url: string;
  /** Who made the image, e.g. "Image Credit & Copyright: Brian Hopkins". */
  credit: string | null;
};

/** What the browser sends to get a picture explained: only its date. */
export const explainSchema = z.object({
  date: z.iso.date("Please send a date like 2024-01-01"),
});

/** The tags Gemini may choose from. */
export const TAGS = [
  "גלקסיה",
  "ערפילית",
  "כוכב",
  "כוכב לכת",
  "ירח",
  "שמש",
  "כדור הארץ",
  "שביט",
  "חור שחור",
  "שביל החלב",
  "צביר כוכבים",
  "סופרנובה",
  "ליקוי",
  "זוהר קוטבי",
  "חללית",
  "טלסקופ",
] as const;

const hebrew = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .refine((text) => /\p{Script=Hebrew}/u.test(text), "Not in Hebrew");

/**
 * What Gemini must answer. The server sends it to Gemini as the structured
 * output schema, and still checks the answer against it: LLMs don't always
 * do what they're told.
 */
export const explanationSchema = z.object({
  title_he: hebrew(120),
  summary_he: hebrew(600),
  tags: z.array(z.enum(TAGS)).min(1).max(5),
});

/** A saved explanation, as the API returns it. */
export type Explanation = z.infer<typeof explanationSchema> & { date: string };

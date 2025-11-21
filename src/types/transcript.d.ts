// src/types/transcript.d.ts
declare interface TranscriptSummary {
  title: string;
  summary: string;
  timestamps?: { time: string; text: string }[];
  keywords?: string[];
}

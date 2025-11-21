// src/types/debate.d.ts
declare interface Argument {
  point: string;
  evidence: string;
  rebuttal?: string;
}

declare interface DebatePrep {
  title: string;
  stance: string; // "for" or "against"
  introduction: string;
  arguments: Argument[];
  conclusion: string;
}

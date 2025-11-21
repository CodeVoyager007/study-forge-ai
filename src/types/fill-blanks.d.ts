// src/types/fill-blanks.d.ts
declare interface FillInTheBlankItem {
  sentence: string;
  blanks: {
    index: number; // position of the blank in the sentence parts array
    correctAnswer: string;
    userAnswer?: string;
  }[];
}

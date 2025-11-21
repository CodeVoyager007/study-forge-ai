// src/types/mnemonic.d.ts
declare interface Mnemonic {
  concept: string;
  mnemonic: string;
  type: string; // Acronym, Rhyme, Visual, etc.
  explanation?: string;
  keywords?: string[];
}

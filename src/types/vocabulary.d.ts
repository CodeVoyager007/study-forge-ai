// src/types/vocabulary.d.ts
declare interface VocabularyWord {
  word: string;
  partOfSpeech?: string;
  part_of_speech?: string;
  definition: string;
  example?: string;
  exampleSentence?: string;
  example_sentence?: string;
  synonyms?: string[];
  memoryTip?: string;
  memory_tip?: string;
}

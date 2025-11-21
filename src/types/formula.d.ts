// src/types/formula.d.ts
declare interface Formula {
  name: string;
  formula: string;
  variables?: { [key: string]: string };
  whenToUse?: string;
  when_to_use?: string;
  example?: string;
  commonMistakes?: string;
  common_mistakes?: string;
}

declare interface FormulaCategory {
  name: string;
  formulas: Formula[];
}

declare interface FormulasMaterial {
  title?: string;
  categories: FormulaCategory[];
}

// src/types/comparison.d.ts
declare interface ComparisonItem {
  name: string;
  [key: string]: string; // Dynamic properties for criteria
}

declare interface ComparisonTable {
  title: string;
  description?: string;
  criteria: string[];
  items: ComparisonItem[];
}

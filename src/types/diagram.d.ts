// src/types/diagram.d.ts
declare interface Diagram {
  title?: string;
  description?: string;
  elements?: { name?: string; label?: string; description?: string }[];
  connections?: { from?: string; to?: string; relationship?: string; label?: string }[];
}

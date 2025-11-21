// src/types/case-study.d.ts
declare interface AnalysisSection {
  heading: string;
  content: string;
}

declare interface CaseStudyAnalysis {
  title: string;
  summary: string;
  sections: AnalysisSection[];
  recommendations?: string[];
  keywords?: string[];
}

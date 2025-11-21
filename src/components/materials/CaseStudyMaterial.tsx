import { Card } from "@/components/ui/card";
import { CaseStudyAnalysis } from "@/types/case-study";

interface CaseStudyMaterialProps {
  caseStudyAnalysis: CaseStudyAnalysis;
}

const CaseStudyMaterial = ({ caseStudyAnalysis }: CaseStudyMaterialProps) => {
  return (
    <div className="space-y-6">
      <Card className="p-8 bg-card border-border space-y-4">
        <h3 className="text-2xl font-bold">{caseStudyAnalysis.title || "Untitled Analysis"}</h3>
        
        {caseStudyAnalysis.summary && (
          <div className="prose prose-invert max-w-none">
            <p className="mb-4 text-foreground/90 leading-relaxed">
              {caseStudyAnalysis.summary}
            </p>
          </div>
        )}

        {caseStudyAnalysis.sections && caseStudyAnalysis.sections.length > 0 && (
          <div className="space-y-4 pt-4">
            {caseStudyAnalysis.sections.map((section, idx) => (
              <div key={idx} className="space-y-2">
                <h4 className="font-semibold text-lg text-primary">{section.heading}</h4>
                <p className="text-muted-foreground">{section.content}</p>
              </div>
            ))}
          </div>
        )}

        {caseStudyAnalysis.recommendations && caseStudyAnalysis.recommendations.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border mt-4">
            <h4 className="font-semibold text-lg mb-2">Recommendations</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              {caseStudyAnalysis.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        )}

        {caseStudyAnalysis.keywords && caseStudyAnalysis.keywords.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border mt-4">
            <h4 className="font-semibold text-lg mb-2">Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {caseStudyAnalysis.keywords.map((keyword, idx) => (
                <span key={idx} className="px-3 py-1 text-sm rounded-full bg-secondary/20 text-secondary-foreground border border-secondary/30">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CaseStudyMaterial;

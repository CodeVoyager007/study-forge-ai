import { Card } from "@/components/ui/card";
import { TranscriptSummary } from "@/types/transcript";

interface TranscriptMaterialProps {
  transcriptSummary: TranscriptSummary;
}

const TranscriptMaterial = ({ transcriptSummary }: TranscriptMaterialProps) => {
  return (
    <div className="space-y-6">
      <Card className="p-8 bg-card border-border space-y-4">
        <h3 className="text-2xl font-bold">{transcriptSummary.title || "Untitled Summary"}</h3>
        
        {transcriptSummary.summary && (
          <div className="prose prose-invert max-w-none">
            <p className="mb-4 text-foreground/90 leading-relaxed">
              {transcriptSummary.summary}
            </p>
          </div>
        )}

        {transcriptSummary.timestamps && transcriptSummary.timestamps.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border mt-4">
            <h4 className="font-semibold text-lg mb-2">Key Timestamps</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {transcriptSummary.timestamps.map((ts, idx) => (
                <li key={idx} className="text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">{ts.time}:</span> {ts.text}
                </li>
              ))}
            </ul>
          </div>
        )}

        {transcriptSummary.keywords && transcriptSummary.keywords.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border mt-4">
            <h4 className="font-semibold text-lg mb-2">Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {transcriptSummary.keywords.map((keyword, idx) => (
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

export default TranscriptMaterial;

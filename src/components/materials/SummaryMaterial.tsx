import { Card } from "@/components/ui/card";
import { Summary } from "@/types/summary";

interface SummaryMaterialProps {
  summary: Summary;
}

const SummaryMaterial = ({ summary }: SummaryMaterialProps) => {
  return (
    <div className="space-y-6">
      <Card className="p-8 bg-card border-border space-y-4">
        <h3 className="text-2xl font-bold">{summary.title}</h3>

        <div className="prose prose-invert max-w-none">
          {typeof summary.content === 'string' ? (
            summary.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4 text-foreground/90 leading-relaxed">
                {paragraph}
              </p>
            ))
          ) : (
            <ul className="space-y-2">
              {(summary.content || []).map((point, idx) => (
                <li key={idx} className="text-foreground/90">{point}</li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      {summary.keyPoints && summary.keyPoints.length > 0 && (
        <Card className="p-6 bg-card border-border">
          <h4 className="font-semibold text-lg mb-3">Key Takeaways</h4>
          <ul className="space-y-2">
            {summary.keyPoints.map((point, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default SummaryMaterial;

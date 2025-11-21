import { Card } from "@/components/ui/card";
import { Essay } from "@/types/essay";

interface EssayMaterialProps {
  essay: Essay;
}

const EssayMaterial = ({ essay }: EssayMaterialProps) => {
  return (
    <div className="space-y-6">
      <Card className="p-8 bg-card border-border space-y-4">
        <h3 className="text-2xl font-bold">{essay.title}</h3>

        <div className="prose prose-invert max-w-none">
          {(essay.content || "").split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="mb-4 text-foreground/90 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </Card>

      {essay.citations && essay.citations.length > 0 && (
        <Card className="p-6 bg-card border-border">
          <h4 className="font-semibold text-lg mb-3">References</h4>
          <ul className="space-y-2">
            {essay.citations.map((citation, idx) => (
              <li key={idx} className="text-sm text-muted-foreground">
                {citation}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default EssayMaterial;

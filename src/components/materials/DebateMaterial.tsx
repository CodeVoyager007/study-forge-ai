import { Card } from "@/components/ui/card";
import { DebatePrep } from "@/types/debate";

interface DebateMaterialProps {
  debatePrep: DebatePrep;
}

const DebateMaterial = ({ debatePrep }: DebateMaterialProps) => {
  return (
    <div className="space-y-6">
      <Card className="p-8 bg-card border-border space-y-4">
        <h3 className="text-2xl font-bold">{debatePrep.title || "Debate Preparation"}</h3>
        <p className="text-muted-foreground font-semibold">Stance: {debatePrep.stance === "for" ? "For the motion" : "Against the motion"}</p>
        
        {debatePrep.introduction && (
          <div className="prose prose-invert max-w-none">
            <h4 className="font-semibold text-lg text-primary">Introduction</h4>
            <p className="mb-4 text-foreground/90 leading-relaxed">
              {debatePrep.introduction}
            </p>
          </div>
        )}

        {debatePrep.arguments && debatePrep.arguments.length > 0 && (
          <div className="space-y-6 pt-4">
            <h4 className="font-semibold text-lg text-primary">Arguments</h4>
            {debatePrep.arguments.map((arg, idx) => (
              <Card key={idx} className="p-6 bg-secondary/20 border-border space-y-3">
                <h5 className="font-semibold text-xl">{`Argument ${idx + 1}: ${arg.point}`}</h5>
                <p className="text-muted-foreground"><strong>Evidence:</strong> {arg.evidence}</p>
                {arg.rebuttal && <p className="text-muted-foreground"><strong>Possible Rebuttal:</strong> {arg.rebuttal}</p>}
              </Card>
            ))}
          </div>
        )}

        {debatePrep.conclusion && (
          <div className="prose prose-invert max-w-none pt-4 border-t border-border mt-4">
            <h4 className="font-semibold text-lg text-primary">Conclusion</h4>
            <p className="mb-4 text-foreground/90 leading-relaxed">
              {debatePrep.conclusion}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DebateMaterial;

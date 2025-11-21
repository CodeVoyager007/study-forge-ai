import { Card } from "@/components/ui/card";
import { Mnemonic } from "@/types/mnemonic";

interface MnemonicMaterialProps {
  mnemonic: Mnemonic;
}

const MnemonicMaterial = ({ mnemonic }: MnemonicMaterialProps) => {
  return (
    <div className="space-y-6">
      <Card className="p-8 bg-card border-border space-y-4">
        <h3 className="text-2xl font-bold">{mnemonic.concept || "Untitled Concept"}</h3>
        <p className="text-muted-foreground font-semibold">Mnemonic Type: {mnemonic.type}</p>
        
        {mnemonic.mnemonic && (
          <div className="prose prose-invert max-w-none">
            <h4 className="font-semibold text-lg text-primary">Mnemonic:</h4>
            <p className="mb-4 text-foreground/90 leading-relaxed">
              {mnemonic.mnemonic}
            </p>
          </div>
        )}

        {mnemonic.explanation && (
          <div className="prose prose-invert max-w-none pt-4 border-t border-border mt-4">
            <h4 className="font-semibold text-lg text-primary">Explanation:</h4>
            <p className="mb-4 text-foreground/90 leading-relaxed">
              {mnemonic.explanation}
            </p>
          </div>
        )}

        {mnemonic.keywords && mnemonic.keywords.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border mt-4">
            <h4 className="font-semibold text-lg mb-2">Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {mnemonic.keywords.map((keyword, idx) => (
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

export default MnemonicMaterial;

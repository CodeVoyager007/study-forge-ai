import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormulasMaterial as FormulasMaterialType } from "@/types/formula"; // Renamed to avoid conflict

interface FormulasMaterialProps {
  formulas: FormulasMaterialType;
}

const FormulasMaterial = ({ formulas }: FormulasMaterialProps) => {
  return (
    <Card className="p-8 card-elegant border-border/50 animate-fade-in">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{formulas.title || "Formula Sheet"}</h2>
          {/* Re-add export PDF functionality if needed, for now just a placeholder button */}
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>

        {formulas.categories?.map((category, catIndex: number) => (
          <div key={catIndex} className="space-y-4">
            <h3 className="text-xl font-semibold text-primary">{category.name}</h3>

            <div className="grid gap-4">
              {category.formulas?.map((formula, formulaIndex: number) => (
                <Card key={formulaIndex} className="p-6 bg-secondary/30 border-border/50">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <h4 className="text-lg font-semibold">{formula.name}</h4>
                    </div>

                    <div className="p-4 rounded-lg bg-background/50 font-mono text-center text-lg">
                      {formula.formula}
                    </div>

                    {formula.variables && (
                      <div className="space-y-2">
                        <p className="font-semibold text-sm text-muted-foreground">Where:</p>
                        <div className="space-y-1 text-sm">
                          {Object.entries(formula.variables).map(([key, value]: [string, any]) => (
                            <p key={key}>
                              <span className="font-mono text-primary">{key}</span> = {value}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {(formula.whenToUse || formula.when_to_use) && (
                      <div className="text-sm">
                        <span className="font-semibold text-muted-foreground">When to use: </span>
                        {formula.whenToUse || formula.when_to_use}
                      </div>
                    )}

                    {formula.example && (
                      <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                        <p className="text-sm">
                          <span className="font-semibold text-accent">Example: </span>
                          {formula.example}
                        </p>
                      </div>
                    )}

                    {(formula.commonMistakes || formula.common_mistakes) && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-sm">
                          <span className="font-semibold text-destructive">⚠️ Common Mistakes: </span>
                          {formula.commonMistakes || formula.common_mistakes}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default FormulasMaterial;

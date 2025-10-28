import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Calculator, Download, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";

const GenerateFormulas = () => {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [formulas, setFormulas] = useState<any>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-formulas', {
        body: { topic, difficulty }
      });

      if (error) {
        if (error.message?.includes('429') || error.message?.includes('rate limit')) {
          throw new Error('Rate limit exceeded. Please try again in a few moments.');
        }
        if (error.message?.includes('402') || error.message?.includes('payment')) {
          throw new Error('AI credits depleted. Please add credits to continue.');
        }
        throw error;
      }

      setFormulas(data.formulas);

      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('generated_materials').insert({
          user_id: user.id,
          type: 'formulas',
          title: `Formulas: ${topic}`,
          content: data.formulas,
          difficulty,
          metadata: { topic }
        });
      }

      toast({
        title: "Success",
        description: "Formula sheet generated successfully!",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate formulas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4 animate-fade-in-down">
            <Link to="/generate">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tools
              </Button>
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="gradient-text">Formula Sheets</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Generate comprehensive formula sheets for any subject
            </p>
          </div>

          <Card className="p-8 card-elegant border-border/50 animate-scale-in">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="topic">Subject or Topic</Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Calculus, Physics Mechanics, Chemistry Equations"
                  className="bg-background/50 border-border/50 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label>Difficulty Level</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="bg-background/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow-lg transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Calculator className="mr-2 h-4 w-4" />
                    Generate Formula Sheet
                  </>
                )}
              </Button>
            </div>
          </Card>

          {formulas && (
            <Card className="p-8 card-elegant border-border/50 animate-fade-in">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">{formulas.title || `${topic} Formulas`}</h2>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export PDF
                  </Button>
                </div>

                {formulas.categories?.map((category: any, catIndex: number) => (
                  <div key={catIndex} className="space-y-4">
                    <h3 className="text-xl font-semibold text-primary">{category.name}</h3>
                    
                    <div className="grid gap-4">
                      {category.formulas?.map((formula: any, formulaIndex: number) => (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateFormulas;

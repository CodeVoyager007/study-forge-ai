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
    setFormulas(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-formulas`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ topic, difficulty }),
        }
      );
      
      if (!response.ok) {
        throw new Error(await response.text());
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Failed to read response stream");
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let finalFormulas: any = {};

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonString = line.substring(6);
              const chunk = JSON.parse(jsonString);

              if (chunk.candidates && chunk.candidates.length > 0) {
                const functionCall = chunk.candidates[0].content.parts[0].functionCall;
                if (functionCall && functionCall.args) {
                    finalFormulas = deepMerge(finalFormulas, functionCall.args);
                    setFormulas({ ...finalFormulas });
                }
              }
            } catch (e) {
              // Incomplete JSON
            }
          }
        }
      }
      
      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('generated_materials').insert({
          user_id: user.id,
          type: 'formulas',
          title: `Formulas: ${topic}`,
          content: finalFormulas,
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

  const deepMerge = (target: any, source: any) => {
    for (const key in source) {
      if (source[key] instanceof Object && key in target) {
        Object.assign(source[key], deepMerge(target[key], source[key]))
      }
    }
    Object.assign(target || {}, source)
    return target
  }

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

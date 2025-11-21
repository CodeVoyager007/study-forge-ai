import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Save, ArrowLeft, Table } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ComparisonItem {
  name: string;
  [key: string]: string; // Dynamic properties for criteria
}

interface ComparisonTable {
  title: string;
  description?: string;
  criteria: string[];
  items: ComparisonItem[];
}

const GenerateComparison = () => {
  const [topic, setTopic] = useState("");
  const [itemsToCompare, setItemsToCompare] = useState(""); // comma-separated
  const [comparisonCriteria, setComparisonCriteria] = useState(""); // comma-separated
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [comparisonTable, setComparisonTable] = useState<Partial<ComparisonTable>>({});
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim() || !itemsToCompare.trim() || !comparisonCriteria.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a topic, items to compare, and comparison criteria",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setGenerated(true);
    setComparisonTable({});

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-comparison-table`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            topic: topic.trim(),
            items: itemsToCompare.split(',').map(i => i.trim()),
            criteria: comparisonCriteria.split(',').map(c => c.trim()),
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(
            "Rate limit exceeded. Please try again in a few moments."
          );
        }
        if (response.status === 402) {
          throw new Error("AI credits depleted. Please add credits to continue.");
        }
        const errorText = await response.text();
        throw new Error(errorText || "Failed to generate comparison table");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

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
                  setComparisonTable(prev => {
                    const newTable = { ...prev };
                    const args = functionCall.args;
                    if (args.title) newTable.title = args.title;
                    if (args.description) newTable.description = (newTable.description || "") + args.description;
                    if (args.criteria) newTable.criteria = [...(newTable.criteria || []), ...args.criteria];
                    if (args.items) newTable.items = [...(newTable.items || []), ...args.items];
                    return newTable;
                  });
                }
              }
            } catch (e) {
              // Incomplete JSON
            }
          }
        }
      }
      
      toast({
        title: "Comparison Table Generated!",
        description: `Finished creating comparison table for ${topic}`,
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate comparison table",
        variant: "destructive",
      });
      setGenerated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!comparisonTable?.title || !comparisonTable?.items?.length) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("generated_materials").insert([
        {
          user_id: user.id,
          title: `Comparison: ${comparisonTable.title}`,
          type: "comparison-table",
          content: { comparisonTable } as any,
          metadata: { topic, itemsToCompare, comparisonCriteria } as any,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Saved Successfully",
        description: "Comparison table saved to your dashboard",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 relative overflow-hidden">
      <div className="fixed inset-0 mesh-bg opacity-20" />
      <div className="fixed inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <Link to="/generate">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tools
              </Button>
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="gradient-text">Comparison Table Generator</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Generate side-by-side comparison tables for concepts or items
            </p>
          </div>

          {!generated ? (
            <Card className="p-8 bg-card/60 backdrop-blur-md border-2 border-border/50 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Operating Systems, Historical Empires..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="itemsToCompare">Items to Compare (comma-separated)</Label>
                  <Input
                    id="itemsToCompare"
                    placeholder="e.g., Windows, MacOS, Linux"
                    value={itemsToCompare}
                    onChange={(e) => setItemsToCompare(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comparisonCriteria">Comparison Criteria (comma-separated)</Label>
                  <Textarea
                    id="comparisonCriteria"
                    placeholder="e.g., User Interface, Security, Cost, Ecosystem"
                    value={comparisonCriteria}
                    onChange={(e) => setComparisonCriteria(e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-glow shadow-lg hover:shadow-primary/50 transition-all h-12"
              >
                {loading ? (
                  "Generating..."
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Comparison Table
                  </>
                )}
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Comparison Table</h2>
                {!loading && (
                  <Button onClick={handleSave} variant="outline">
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                )}
              </div>

              {comparisonTable.items && comparisonTable.items.length > 0 && comparisonTable.criteria && comparisonTable.criteria.length > 0 ? (
                <Card className="p-8 bg-card border-border">
                  <h3 className="text-2xl font-bold mb-4">{comparisonTable.title}</h3>
                  {comparisonTable.description && <p className="text-muted-foreground mb-6">{comparisonTable.description}</p>}

                  <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto">
                      <thead>
                        <tr className="bg-secondary/20">
                          <th className="p-3 font-semibold text-primary">Item</th>
                          {comparisonTable.criteria.map((criterion, idx) => (
                            <th key={idx} className="p-3 font-semibold text-primary">{criterion}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonTable.items.map((item, itemIdx) => (
                          <tr key={itemIdx} className="border-t border-border/50 hover:bg-secondary/10">
                            <td className="p-3 font-medium">{item.name}</td>
                            {comparisonTable.criteria.map((criterion, critIdx) => (
                              <td key={critIdx} className="p-3 text-muted-foreground">
                                {item[criterion.toLowerCase().replace(/\s/g, '')] || 'N/A'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              ) : (
                <Card className="p-8 bg-card border-border">
                  <p className="text-muted-foreground">No comparison data available.</p>
                </Card>
              )}

              <Button
                onClick={() => { setGenerated(false); setComparisonTable({}); }}
                variant="outline"
                className="w-full"
              >
                Generate New Comparison Table
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateComparison;

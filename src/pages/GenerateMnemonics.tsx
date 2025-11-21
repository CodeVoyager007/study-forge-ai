import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Save, ArrowLeft, Lightbulb, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Mnemonic {
  concept: string;
  mnemonic: string;
  type: string; // Acronym, Rhyme, Visual, etc.
  explanation?: string;
  keywords?: string[];
}

const GenerateMnemonics = () => {
  const [concept, setConcept] = useState("");
  const [keywords, setKeywords] = useState(""); // comma-separated
  const [mnemonicType, setMnemonicType] = useState("acronym"); // 'acronym', 'rhyme', 'visual', 'story'
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mnemonic, setMnemonic] = useState<Partial<Mnemonic>>({});
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!concept.trim()) {
      toast({
        title: "Concept Required",
        description: "Please enter a concept for which to generate a mnemonic",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setGenerated(true);
    setMnemonic({});

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-mnemonic`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            concept: concept.trim(),
            keywords: keywords.split(',').map(k => k.trim()),
            mnemonicType,
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
        throw new Error(errorText || "Failed to generate mnemonic");
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
                  setMnemonic(prev => {
                    const newMnemonic = { ...prev };
                    const args = functionCall.args;
                    if (args.concept) newMnemonic.concept = args.concept;
                    if (args.mnemonic) newMnemonic.mnemonic = args.mnemonic;
                    if (args.type) newMnemonic.type = args.type;
                    if (args.explanation) newMnemonic.explanation = (newMnemonic.explanation || "") + args.explanation;
                    if (args.keywords) newMnemonic.keywords = [...(newMnemonic.keywords || []), ...args.keywords];
                    return newMnemonic;
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
        title: "Mnemonic Generated!",
        description: `Finished creating mnemonic for ${concept}`,
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate mnemonic",
        variant: "destructive",
      });
      setGenerated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!mnemonic?.concept || !mnemonic?.mnemonic) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("generated_materials").insert([
        {
          user_id: user.id,
          title: `Mnemonic: ${mnemonic.concept}`,
          type: "mnemonic",
          content: { mnemonic } as any,
          metadata: { concept, keywords, mnemonicType } as any,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Saved Successfully",
        description: "Mnemonic saved to your dashboard",
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
              <span className="gradient-text">Mnemonic Generator</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Create acronyms, rhymes, and visual cues to boost memory
            </p>
          </div>

          {!generated ? (
            <Card className="p-8 bg-card/60 backdrop-blur-md border-2 border-border/50 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="concept">Concept to Remember</Label>
                  <Input
                    id="concept"
                    placeholder="e.g., Order of Operations, Parts of a Cell..."
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords / Key Information (comma-separated, optional)</Label>
                  <Textarea
                    id="keywords"
                    placeholder="e.g., Parentheses, Exponents, Multiplication, Division, Addition, Subtraction"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="bg-background min-h-32"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Mnemonic Type</Label>
                  <RadioGroup value={mnemonicType} onValueChange={setMnemonicType}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="acronym" id="type-acronym" />
                      <Label htmlFor="type-acronym" className="font-normal cursor-pointer">Acronym</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="rhyme" id="type-rhyme" />
                      <Label htmlFor="type-rhyme" className="font-normal cursor-pointer">Rhyme/Song</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="visual" id="type-visual" />
                      <Label htmlFor="type-visual" className="font-normal cursor-pointer">Visual Imagery</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="story" id="type-story" />
                      <Label htmlFor="type-story" className="font-normal cursor-pointer">Short Story</Label>
                    </div>
                  </RadioGroup>
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
                    Generate Mnemonic
                  </>
                )}
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Mnemonic</h2>
                {!loading && (
                  <Button onClick={handleSave} variant="outline">
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                )}
              </div>

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

              <Button
                onClick={() => { setGenerated(false); setMnemonic({}); }}
                variant="outline"
                className="w-full"
              >
                Generate New Mnemonic
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateMnemonics;

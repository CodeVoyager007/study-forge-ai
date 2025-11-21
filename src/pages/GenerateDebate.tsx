import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Save, ArrowLeft, Mic } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Argument {
  point: string;
  evidence: string;
  rebuttal?: string;
}

interface DebatePrep {
  title: string;
  stance: string; // "for" or "against"
  introduction: string;
  arguments: Argument[];
  conclusion: string;
}

const GenerateDebate = () => {
  const [topic, setTopic] = useState("");
  const [stance, setStance] = useState("for"); // 'for' or 'against'
  const [numArguments, setNumArguments] = useState("3");
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [debatePrep, setDebatePrep] = useState<Partial<DebatePrep>>({});
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a debate topic",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setGenerated(true);
    setDebatePrep({});

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-debate-prep`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            topic: topic.trim(),
            stance,
            numArguments: parseInt(numArguments),
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
        throw new Error(errorText || "Failed to generate debate prep");
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
                  setDebatePrep(prev => {
                    const newPrep = { ...prev };
                    const args = functionCall.args;
                    if (args.title) newPrep.title = args.title;
                    if (args.stance) newPrep.stance = args.stance;
                    if (args.introduction) newPrep.introduction = (newPrep.introduction || "") + args.introduction;
                    if (args.arguments) newPrep.arguments = [...(newPrep.arguments || []), ...args.arguments];
                    if (args.conclusion) newPrep.conclusion = (newPrep.conclusion || "") + args.conclusion;
                    return newPrep;
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
        title: "Debate Prep Generated!",
        description: `Finished creating prep for ${topic}`,
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate debate prep",
        variant: "destructive",
      });
      setGenerated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!debatePrep?.title || !debatePrep?.arguments?.length) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("generated_materials").insert([
        {
          user_id: user.id,
          title: `Debate Prep: ${debatePrep.title}`,
          type: "debate-prep",
          content: { debatePrep } as any,
          metadata: { topic, stance, numArguments } as any,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Saved Successfully",
        description: "Debate prep saved to your dashboard",
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
              <span className="gradient-text">Debate Prep Generator</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Generate arguments, rebuttals, and evidence for any debate topic
            </p>
          </div>

          {!generated ? (
            <Card className="p-8 bg-card/60 backdrop-blur-md border-2 border-border/50 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Debate Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Universal Basic Income, Climate Change Policy..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Your Stance</Label>
                  <RadioGroup value={stance} onValueChange={setStance} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="for" id="stance-for" />
                      <Label htmlFor="stance-for" className="font-normal cursor-pointer">For the motion</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="against" id="stance-against" />
                      <Label htmlFor="stance-against" className="font-normal cursor-pointer">Against the motion</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numArguments">Number of Main Arguments</Label>
                  <Input
                    id="numArguments"
                    type="number"
                    min="1"
                    max="5"
                    value={numArguments}
                    onChange={(e) => setNumArguments(e.target.value)}
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
                    Generate Debate Prep
                  </>
                )}
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Debate Preparation</h2>
                {!loading && (
                  <Button onClick={handleSave} variant="outline">
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                )}
              </div>

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

              <Button
                onClick={() => { setGenerated(false); setDebatePrep({}); }}
                variant="outline"
                className="w-full"
              >
                Generate New Debate Prep
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateDebate;

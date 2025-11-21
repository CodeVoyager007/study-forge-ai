import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Sparkles, Save, ArrowLeft, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QnAItem {
  question: string;
  answer: string;
}

const GenerateQna = () => {
  const [topic, setTopic] = useState("");
  const [numPairs, setNumPairs] = useState([5]);
  const [difficulty, setDifficulty] = useState("medium");
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qnaPairs, setQnaPairs] = useState<QnAItem[]>([]);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic to generate Q&A",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setGenerated(true);
    setQnaPairs([]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-qna`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            topic: topic.trim(),
            difficulty,
            numPairs: numPairs[0],
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
        throw new Error(errorText || "Failed to generate Q&A");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Failed to read response stream");
      }

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
                  const partialPairs = functionCall.args.qnaPairs || [];
                  setQnaPairs(currentPairs => [...currentPairs, ...partialPairs]);
                }
              }
            } catch (e) {
              // Incomplete JSON
            }
          }
        }
      }
      
      toast({
        title: "Q&A Generated!",
        description: `Finished creating Q&A pairs on ${topic}`,
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate Q&A",
        variant: "destructive",
      });
      setGenerated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!qnaPairs.length) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("generated_materials").insert([
        {
          user_id: user.id,
          title: `Q&A: ${topic}`,
          type: "qna",
          difficulty,
          content: { qnaPairs } as any,
          metadata: { topic, numPairs: numPairs[0] } as any,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Saved Successfully",
        description: "Q&A saved to your dashboard",
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
              <span className="gradient-text">Q&A Generator</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Generate comprehensive question-answer pairs for any topic
            </p>
          </div>

          {!generated ? (
            <Card className="p-8 bg-card/60 backdrop-blur-md border-2 border-border/50 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Quantum Physics, Roman Empire, Data Structures..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Number of Q&A Pairs: {numPairs[0]}</Label>
                  <Slider
                    value={numPairs}
                    onValueChange={setNumPairs}
                    min={1}
                    max={20}
                    step={1}
                    className="py-4"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Difficulty Level</Label>
                  <Input
                    id="difficulty"
                    type="text"
                    placeholder="e.g., Easy, Medium, Hard"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
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
                    Generate Q&A
                  </>
                )}
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Q&A Pairs</h2>
                {!loading && (
                  <Button onClick={handleSave} variant="outline">
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                )}
              </div>

              <div className="grid gap-4">
                {qnaPairs.map((item, index) => (
                  <Card key={index} className="p-6 bg-card border-border space-y-3">
                    <h3 className="text-lg font-semibold text-primary">Q{index + 1}: {item.question}</h3>
                    <p className="text-muted-foreground">A{index + 1}: {item.answer}</p>
                  </Card>
                ))}
              </div>

              <Button
                onClick={() => { setGenerated(false); setQnaPairs([]); }}
                variant="outline"
                className="w-full"
              >
                Generate New Q&A
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateQna;

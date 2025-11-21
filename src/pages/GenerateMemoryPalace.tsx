import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Save, ArrowLeft, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface MemoryPalaceRoom {
  roomName: string;
  description: string;
  items: { concept: string; visualization: string }[];
}

interface MemoryPalace {
  title: string;
  overview: string;
  rooms: MemoryPalaceRoom[];
  tips?: string[];
}

const GenerateMemoryPalace = () => {
  const [topic, setTopic] = useState("");
  const [keyConcepts, setKeyConcepts] = useState(""); // comma-separated
  const [palaceComplexity, setPalaceComplexity] = useState("medium"); // 'simple', 'medium', 'complex'
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [memoryPalace, setMemoryPalace] = useState<Partial<MemoryPalace>>({});
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim() || !keyConcepts.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a topic and key concepts",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setGenerated(true);
    setMemoryPalace({});

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-memory-palace`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            topic: topic.trim(),
            keyConcepts: keyConcepts.split(',').map(c => c.trim()),
            palaceComplexity,
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
        throw new Error(errorText || "Failed to generate Memory Palace");
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
                  setMemoryPalace(prev => {
                    const newPalace = { ...prev };
                    const args = functionCall.args;
                    if (args.title) newPalace.title = args.title;
                    if (args.overview) newPalace.overview = (newPalace.overview || "") + args.overview;
                    if (args.rooms) newPalace.rooms = [...(newPalace.rooms || []), ...args.rooms];
                    if (args.tips) newPalace.tips = [...(newPalace.tips || []), ...args.tips];
                    return newPalace;
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
        title: "Memory Palace Generated!",
        description: `Finished creating Memory Palace for ${topic}`,
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate Memory Palace",
        variant: "destructive",
      });
      setGenerated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!memoryPalace?.title || !memoryPalace?.rooms?.length) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("generated_materials").insert([
        {
          user_id: user.id,
          title: `Memory Palace: ${memoryPalace.title}`,
          type: "memory-palace",
          content: { memoryPalace } as any,
          metadata: { topic, keyConcepts, palaceComplexity } as any,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Saved Successfully",
        description: "Memory Palace saved to your dashboard",
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
              <span className="gradient-text">Memory Palace Generator</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Create a virtual memory palace for visual memorization techniques
            </p>
          </div>

          {!generated ? (
            <Card className="p-8 bg-card/60 backdrop-blur-md border-2 border-border/50 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Human Anatomy, Historical Events, Periodic Table..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keyConcepts">Key Concepts (comma-separated)</Label>
                  <Textarea
                    id="keyConcepts"
                    placeholder="e.g., Brain, Heart, Lungs, Kidneys (for Human Anatomy)"
                    value={keyConcepts}
                    onChange={(e) => setKeyConcepts(e.target.value)}
                    className="bg-background min-h-32"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Palace Complexity</Label>
                  <RadioGroup value={palaceComplexity} onValueChange={setPalaceComplexity}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="simple" id="complexity-simple" />
                      <Label htmlFor="complexity-simple" className="font-normal cursor-pointer">Simple (few rooms)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="complexity-medium" />
                      <Label htmlFor="complexity-medium" className="font-normal cursor-pointer">Medium (several rooms)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="complex" id="complexity-complex" />
                      <Label htmlFor="complexity-complex" className="font-normal cursor-pointer">Complex (many rooms, intricate details)</Label>
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
                    Generate Memory Palace
                  </>
                )}
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Memory Palace</h2>
                {!loading && (
                  <Button onClick={handleSave} variant="outline">
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                )}
              </div>

              <Card className="p-8 bg-card border-border space-y-4">
                <h3 className="text-2xl font-bold">{memoryPalace.title || "Untitled Memory Palace"}</h3>
                
                {memoryPalace.overview && (
                  <div className="prose prose-invert max-w-none">
                    <p className="mb-4 text-foreground/90 leading-relaxed">
                      {memoryPalace.overview}
                    </p>
                  </div>
                )}

                {memoryPalace.rooms && memoryPalace.rooms.length > 0 && (
                  <div className="space-y-6 pt-4">
                    {memoryPalace.rooms.map((room, idx) => (
                      <Card key={idx} className="p-6 bg-secondary/20 border-border space-y-3">
                        <h4 className="font-semibold text-xl text-primary">{room.roomName}</h4>
                        <p className="text-muted-foreground">{room.description}</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          {room.items.map((item, itemIdx) => (
                            <li key={itemIdx}>
                              <span className="font-semibold">{item.concept}:</span> {item.visualization}
                            </li>
                          ))}
                        </ul>
                      </Card>
                    ))}
                  </div>
                )}

                {memoryPalace.tips && memoryPalace.tips.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border mt-4">
                    <h4 className="font-semibold text-lg mb-2">Tips for Using This Palace</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {memoryPalace.tips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>

              <Button
                onClick={() => { setGenerated(false); setMemoryPalace({}); }}
                variant="outline"
                className="w-full"
              >
                Generate New Memory Palace
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateMemoryPalace;

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sparkles, Save, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Essay {
  title: string;
  content: string;
  citations: string[];
  outline: string[];
}

const GenerateEssay = () => {
  const [topic, setTopic] = useState("");
  const [thesis, setThesis] = useState("");
  const [essayType, setEssayType] = useState("argumentative");
  const [wordCount, setWordCount] = useState("500");
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [essay, setEssay] = useState<Partial<Essay>>({});
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for your essay",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setGenerated(true);
    setEssay({});

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-essay`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            topic: topic.trim(),
            essayType,
            wordCount: parseInt(wordCount) || 500,
            thesis,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.");
        }
        if (response.status === 402) {
          throw new Error("AI credits depleted. Please add credits to continue.");
        }
        const errorText = await response.text();
        throw new Error(errorText || "Failed to generate essay");
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
                  setEssay(prev => {
                    const newEssay = { ...prev };
                    const args = functionCall.args;
                    if (args.title) newEssay.title = args.title;
                    if (args.content) newEssay.content = (newEssay.content || "") + args.content;
                    if (args.citations) newEssay.citations = [...(newEssay.citations || []), ...args.citations];
                    if (args.outline) newEssay.outline = [...(newEssay.outline || []), ...args.outline];
                    return newEssay;
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
        title: "Essay Generation Complete!",
        description: `Finished creating essay on ${topic}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate essay",
        variant: "destructive",
      });
      setGenerated(false);
    }
    finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!essay?.title || !essay?.content) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("generated_materials").insert([
        {
          user_id: user.id,
          title: `Essay: ${topic}`,
          type: "essay",
          content: { essay } as any,
          metadata: { topic, essayType, wordCount } as any,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Saved Successfully",
        description: "Essay saved to your dashboard",
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
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <Link to="/generate">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tools
              </Button>
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="gradient-text">Essay Writer</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Generate comprehensive essays with citations and structure
            </p>
          </div>

          {!generated ? (
            <Card className="p-8 bg-card border-border space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Essay Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Climate Change, Social Media Impact..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thesis">Thesis Statement (Optional)</Label>
                  <Textarea
                    id="thesis"
                    placeholder="Your main argument or position..."
                    value={thesis}
                    onChange={(e) => setThesis(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Essay Type</Label>
                  <RadioGroup value={essayType} onValueChange={setEssayType}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="argumentative" id="argumentative" />
                      <Label htmlFor="argumentative" className="font-normal cursor-pointer">Argumentative</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="persuasive" id="persuasive" />
                      <Label htmlFor="persuasive" className="font-normal cursor-pointer">Persuasive</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="expository" id="expository" />
                      <Label htmlFor="expository" className="font-normal cursor-pointer">Expository</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="narrative" id="narrative" />
                      <Label htmlFor="narrative" className="font-normal cursor-pointer">Narrative</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wordCount">Target Word Count</Label>
                  <Input
                    id="wordCount"
                    type="number"
                    placeholder="500"
                    value={wordCount}
                    onChange={(e) => setWordCount(e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-glow shadow-lg hover:shadow-primary/50 transition-all h-12"
              >
                {loading ? "Generating..." : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Essay
                  </>
                )}
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Essay</h2>
                {!loading && (
                  <Button onClick={handleSave} variant="outline">
                    <Save className="mr-2 h-4 w-4" />
                    Save to Dashboard
                  </Button>
                )}
              </div>

              <Card className="p-8 bg-card border-border space-y-4">
                <h3 className="text-2xl font-bold">{essay.title || "Generating title..."}</h3>
                
                <div className="prose prose-invert max-w-none">
                  {(essay.content || "Generating content...").split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-4 text-foreground/90 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </Card>

              {essay.citations && essay.citations.length > 0 && (
                <Card className="p-6 bg-card border-border">
                  <h4 className="font-semibold text-lg mb-3">References</h4>
                  <ul className="space-y-2">
                    {essay.citations.map((citation, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground">
                        {citation}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              <Button onClick={() => { setGenerated(false); setEssay({}); }} variant="outline" className="w-full">
                Generate New Essay
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateEssay;

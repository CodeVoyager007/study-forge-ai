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

interface Summary {
  title: string;
  content: string | string[];
  keyPoints: string[];
  tags: string[];
}

const GenerateSummary = () => {
  const [topic, setTopic] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [length, setLength] = useState("standard");
  const [format, setFormat] = useState("paragraphs");
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<Partial<Summary>>({});
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for summary",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setGenerated(true);
    setSummary({});

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-summary`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            topic: topic.trim(),
            sourceText,
            length,
            format: format === "bullets" ? "bullet" : "paragraph",
          }),
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
                  setSummary(prev => {
                    const newSummary = { ...prev };
                    const args = functionCall.args;
                    if (args.title) newSummary.title = args.title;
                    if (args.content) {
                      if (typeof args.content === 'string') {
                        newSummary.content = (newSummary.content || "") + args.content;
                      } else if (Array.isArray(args.content)) {
                        newSummary.content = [...(newSummary.content || []), ...args.content];
                      }
                    }
                    if (args.keyPoints) {
                      newSummary.keyPoints = [...(newSummary.keyPoints || []), ...args.keyPoints];
                    }
                    if (args.tags) {
                      newSummary.tags = [...(newSummary.tags || []), ...args.tags];
                    }
                    return newSummary;
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
        title: "Summary Generated!",
        description: `Finished creating summary on ${topic}`,
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate summary",
        variant: "destructive",
      });
      setGenerated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!summary) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("generated_materials").insert([{
        user_id: user.id,
        title: `Summary: ${topic}`,
        type: "summary",
        content: { summary } as any,
        metadata: { topic, length, format } as any
      }]);

      if (error) throw error;

      toast({
        title: "Saved Successfully",
        description: "Summary saved to your dashboard",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
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
              <span className="gradient-text">Summary Generator</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Create concise summaries with key points highlighted
            </p>
          </div>

          {!generated ? (
            <Card className="p-8 bg-card border-border space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., French Revolution, Photosynthesis..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source">Source Material (Optional)</Label>
                  <Textarea
                    id="source"
                    placeholder="Paste text you want summarized..."
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    className="bg-background min-h-32"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Summary Length</Label>
                  <RadioGroup value={length} onValueChange={setLength}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="brief" id="brief" />
                      <Label htmlFor="brief" className="font-normal cursor-pointer">Brief</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="standard" id="standard" />
                      <Label htmlFor="standard" className="font-normal cursor-pointer">Standard</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="detailed" id="detailed" />
                      <Label htmlFor="detailed" className="font-normal cursor-pointer">Detailed</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Format</Label>
                  <RadioGroup value={format} onValueChange={setFormat}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bullets" id="bullets" />
                      <Label htmlFor="bullets" className="font-normal cursor-pointer">Bullet Points</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="paragraphs" id="paragraphs" />
                      <Label htmlFor="paragraphs" className="font-normal cursor-pointer">Paragraphs</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="structured" id="structured" />
                      <Label htmlFor="structured" className="font-normal cursor-pointer">Structured</Label>
                    </div>
                  </RadioGroup>
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
                    Generate Summary
                  </>
                )}
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Summary</h2>
                {!loading && (
                  <Button onClick={handleSave} variant="outline">
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                )}
              </div>

              <Card className="p-8 bg-card border-border space-y-4">
                <h3 className="text-2xl font-bold">{summary.title || 'Generating...'}</h3>
                
                <div className="prose prose-invert max-w-none">
                  {typeof summary.content === 'string' ? (
                    summary.content.split('\n\n').map((paragraph, idx) => (
                      <p key={idx} className="mb-4 text-foreground/90 leading-relaxed">
                        {paragraph || '...'}
                      </p>
                    ))
                  ) : (
                    <ul className="space-y-2">
                      {(summary.content || []).map((point, idx) => (
                        <li key={idx} className="text-foreground/90">{point}</li>
                      ))}
                    </ul>
                  )}
                  {loading && <p>...</p>}
                </div>
              </Card>

              {summary.keyPoints && summary.keyPoints.length > 0 && (
                <Card className="p-6 bg-card border-border">
                  <h4 className="font-semibold text-lg mb-3">Key Takeaways</h4>
                  <ul className="space-y-2">
                    {summary.keyPoints.map((point, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              <Button onClick={() => { setGenerated(false); setSummary({}); }} variant="outline" className="w-full">
                Generate New Summary
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateSummary;

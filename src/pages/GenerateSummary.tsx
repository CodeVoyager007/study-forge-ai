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

const GenerateSummary = () => {
  const [topic, setTopic] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [length, setLength] = useState("standard");
  const [format, setFormat] = useState("paragraphs");
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for summary",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setGenerated(true);
      setLoading(false);
      toast({
        title: "Summary Generated!",
        description: `Created ${length} summary on ${topic}`,
      });
    }, 2000);
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
                <Button variant="outline">
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>

              <Card className="p-8 bg-card border-border">
                <div className="prose prose-invert max-w-none">
                  <p className="text-muted-foreground">Summary will appear here after generation.</p>
                </div>
              </Card>

              <Button onClick={() => setGenerated(false)} variant="outline" className="w-full">
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

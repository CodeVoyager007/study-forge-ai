import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Save, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const GenerateVocabulary = () => {
  const [topic, setTopic] = useState("");
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const mockWords = [
    { word: "Photosynthesis", definition: "The process by which plants convert light into energy", example: "Plants use photosynthesis to create food.", pronunciation: "foh-toh-SIN-thuh-sis" },
    { word: "Mitochondria", definition: "The powerhouse of the cell", example: "Mitochondria generate ATP for cellular energy.", pronunciation: "my-toh-KON-dree-uh" },
  ];

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for vocabulary building",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setGenerated(true);
      setLoading(false);
      toast({
        title: "Vocabulary List Generated!",
        description: `Created word list for ${topic}`,
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
              <span className="gradient-text">Vocabulary Builder</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Build your vocabulary with definitions, examples, and spaced repetition
            </p>
          </div>

          {!generated ? (
            <Card className="p-8 bg-card border-border space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic or Subject</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Biology, SAT Words, Business English..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
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
                    Generate Vocabulary
                  </>
                )}
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Vocabulary List</h2>
                <Button variant="outline">
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>

              <div className="grid gap-4">
                {mockWords.map((item, index) => (
                  <Card key={index} className="p-6 bg-card border-border">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-2xl font-bold">{item.word}</h3>
                          <p className="text-sm text-muted-foreground italic">{item.pronunciation}</p>
                        </div>
                      </div>
                      <p className="text-foreground">{item.definition}</p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold">Example:</span> {item.example}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>

              <Button onClick={() => setGenerated(false)} variant="outline" className="w-full">
                Generate New List
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateVocabulary;

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Sparkles, Save, ArrowLeft, RotateCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const GenerateFlashcards = () => {
  const [topic, setTopic] = useState("");
  const [numCards, setNumCards] = useState([20]);
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [flipped, setFlipped] = useState<number[]>([]);
  const { toast } = useToast();

  // Mock flashcards
  const mockFlashcards = [
    { front: "What is photosynthesis?", back: "The process by which plants convert light energy into chemical energy (glucose) using chlorophyll." },
    { front: "Define osmosis", back: "The movement of water molecules across a semi-permeable membrane from an area of high concentration to low concentration." },
    { front: "What is mitosis?", back: "A type of cell division that results in two daughter cells, each with the same number of chromosomes as the parent cell." },
  ];

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic to generate flashcards",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setGenerated(true);
      setLoading(false);
      toast({
        title: "Flashcards Generated!",
        description: `Created ${numCards[0]} flashcards on ${topic}`,
      });
    }, 2000);
  };

  const toggleFlip = (index: number) => {
    setFlipped(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleSave = () => {
    toast({
      title: "Saved Successfully",
      description: "Flashcards saved to your dashboard",
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <Link to="/generate">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tools
              </Button>
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="gradient-text">Flashcard Generator</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Create interactive flashcards for effective memorization
            </p>
          </div>

          {/* Input Form */}
          {!generated ? (
            <Card className="p-8 bg-card border-border space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Spanish Vocabulary, Chemistry Terms, Historical Dates..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Number of Cards: {numCards[0]}</Label>
                  <Slider
                    value={numCards}
                    onValueChange={setNumCards}
                    min={10}
                    max={100}
                    step={10}
                    className="py-4"
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
                    Generate Flashcards
                  </>
                )}
              </Button>
            </Card>
          ) : (
            <>
              {/* Generated Flashcards */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Your Flashcards</h2>
                  <Button onClick={handleSave} variant="outline">
                    <Save className="mr-2 h-4 w-4" />
                    Save to Dashboard
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {mockFlashcards.map((card, index) => (
                    <div
                      key={index}
                      onClick={() => toggleFlip(index)}
                      className="cursor-pointer perspective-1000"
                    >
                      <Card 
                        className={`p-8 h-64 flex flex-col items-center justify-center text-center bg-gradient-to-br transition-all duration-300 ${
                          flipped.includes(index)
                            ? 'from-primary/20 to-primary-glow/20 border-primary/50'
                            : 'from-card to-secondary border-border'
                        } hover:border-primary/50 card-hover`}
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <RotateCw className="h-4 w-4" />
                            <span>Click to flip</span>
                          </div>
                          <p className="text-lg font-medium">
                            {flipped.includes(index) ? card.back : card.front}
                          </p>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => setGenerated(false)}
                  variant="outline"
                  className="w-full"
                >
                  Generate New Flashcards
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateFlashcards;

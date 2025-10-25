import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Sparkles, Save, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const GenerateMCQ = () => {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState([10]);
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Mock generated MCQs
  const mockMCQs = [
    {
      question: "What is the primary function of mitochondria in a cell?",
      options: [
        "Protein synthesis",
        "Energy production (ATP synthesis)",
        "DNA replication",
        "Lipid storage"
      ],
      correct: 1,
      explanation: "Mitochondria are known as the powerhouse of the cell because they generate ATP through cellular respiration."
    },
    {
      question: "Which organelle is responsible for photosynthesis in plant cells?",
      options: [
        "Nucleus",
        "Chloroplast",
        "Ribosome",
        "Golgi apparatus"
      ],
      correct: 1,
      explanation: "Chloroplasts contain chlorophyll and are the site of photosynthesis, converting light energy into chemical energy."
    }
  ];

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic to generate MCQs",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setGenerated(true);
      setLoading(false);
      toast({
        title: "MCQs Generated!",
        description: `Created ${numQuestions[0]} questions on ${topic}`,
      });
    }, 2000);
  };

  const handleSave = () => {
    toast({
      title: "Saved Successfully",
      description: "MCQs saved to your dashboard",
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
              <span className="gradient-text">MCQ Generator</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Generate multiple choice questions with explanations
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
                    placeholder="e.g., Cell Biology, World War 2, Calculus..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Difficulty Level</Label>
                  <RadioGroup value={difficulty} onValueChange={setDifficulty}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="easy" id="easy" />
                      <Label htmlFor="easy" className="font-normal cursor-pointer">Easy</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="medium" />
                      <Label htmlFor="medium" className="font-normal cursor-pointer">Medium</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hard" id="hard" />
                      <Label htmlFor="hard" className="font-normal cursor-pointer">Hard</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Number of Questions: {numQuestions[0]}</Label>
                  <Slider
                    value={numQuestions}
                    onValueChange={setNumQuestions}
                    min={5}
                    max={50}
                    step={5}
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
                    Generate MCQs
                  </>
                )}
              </Button>
            </Card>
          ) : (
            <>
              {/* Generated MCQs */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Your MCQs</h2>
                  <Button onClick={handleSave} variant="outline">
                    <Save className="mr-2 h-4 w-4" />
                    Save to Dashboard
                  </Button>
                </div>

                {mockMCQs.map((mcq, index) => (
                  <Card key={index} className="p-6 bg-card border-border">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        Question {index + 1}: {mcq.question}
                      </h3>
                      
                      <RadioGroup>
                        {mcq.options.map((option, optIndex) => (
                          <div 
                            key={optIndex}
                            className={`flex items-center space-x-2 p-3 rounded-lg ${
                              optIndex === mcq.correct 
                                ? 'bg-primary/10 border border-primary/30' 
                                : 'bg-secondary/50'
                            }`}
                          >
                            <RadioGroupItem value={optIndex.toString()} id={`q${index}-opt${optIndex}`} />
                            <Label htmlFor={`q${index}-opt${optIndex}`} className="font-normal cursor-pointer flex-1">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>

                      <div className="pt-2 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold text-primary">Explanation:</span> {mcq.explanation}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}

                <Button
                  onClick={() => setGenerated(false)}
                  variant="outline"
                  className="w-full"
                >
                  Generate New MCQs
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateMCQ;

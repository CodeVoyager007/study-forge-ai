import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Sparkles, Save, ArrowLeft, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MCQ {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const GenerateMCQ = () => {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState([10]);
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic to generate MCQs",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setGenerated(true);
    setMcqs([]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-mcqs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            topic: topic.trim(),
            difficulty,
            numQuestions: numQuestions[0],
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
        throw new Error(errorText || "Failed to generate MCQs");
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
        
        // Process line by line
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last partial line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonString = line.substring(6);
              const chunk = JSON.parse(jsonString);

              if (chunk.candidates && chunk.candidates.length > 0) {
                const functionCall = chunk.candidates[0].content.parts[0].functionCall;
                if (functionCall && functionCall.args) {
                  const partialMcqs = functionCall.args.questions || [];
                  setMcqs(currentMcqs => [...currentMcqs, ...partialMcqs]);
                }
              }
            } catch (e) {
              // Incomplete JSON, will be completed in the next chunk
            }
          }
        }
      }
      
      toast({
        title: "MCQs Generated!",
        description: `Finished creating questions on ${topic}`,
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate MCQs",
        variant: "destructive",
      });
      setGenerated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (Object.keys(userAnswers).length !== mcqs.length) {
      toast({
        title: "Incomplete",
        description: "Please answer all questions",
        variant: "destructive",
      });
      return;
    }

    let correctCount = 0;
    mcqs.forEach((mcq, index) => {
      if (userAnswers[index] === mcq.correct) correctCount++;
    });

    setScore(correctCount);
    setSubmitted(true);

    toast({
      title: "Submitted!",
      description: `Score: ${correctCount}/${mcqs.length}`,
    });
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("generated_materials").insert([
        {
          user_id: user.id,
          title: `MCQs: ${topic}`,
          type: "mcqs",
          difficulty,
          content: { mcqs, userAnswers, score } as any,
          metadata: { topic, numQuestions: numQuestions[0] } as any,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Saved Successfully",
        description: "MCQs saved to your dashboard",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const isComplete = (mcq: MCQ) => {
    return mcq.question && mcq.options?.length === 4 && mcq.correct !== undefined && mcq.explanation;
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
              <span className="gradient-text">MCQ Generator</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Generate multiple choice questions with explanations
            </p>
          </div>

          {!generated ? (
            <Card className="p-8 bg-card/60 backdrop-blur-md border-2 border-border/50 space-y-6">
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
              <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">Your MCQs</h2>
                    {submitted && (
                      <p className="text-lg text-muted-foreground mt-1">
                        Score: <span className="text-primary font-semibold">{score}/{mcqs.length}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    {!submitted && !loading && mcqs.every(isComplete) && (
                      <Button onClick={handleSubmit} className="bg-primary hover:bg-primary-glow">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Submit Answers
                      </Button>
                    )}
                    {submitted && (
                      <Button onClick={handleSave} variant="outline">
                        <Save className="mr-2 h-4 w-4" />
                        Save to Dashboard
                      </Button>
                    )}
                  </div>
                </div>

                {mcqs.map((mcq, index) => (
                  <Card key={index} className="p-6 bg-card border-border">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        Question {index + 1}: {mcq.question || "..."}
                      </h3>
                      
                      <RadioGroup 
                        value={userAnswers[index]?.toString()}
                        onValueChange={(value) => {
                          if (!submitted) {
                            setUserAnswers(prev => ({ ...prev, [index]: parseInt(value) }));
                          }
                        }}
                        disabled={submitted || !isComplete(mcq)}
                      >
                        {(mcq.options || []).map((option, optIndex) => {
                          const isUserAnswer = userAnswers[index] === optIndex;
                          const isCorrect = optIndex === mcq.correct;
                          const showResult = submitted;

                          let bgClass = 'bg-secondary/50';
                          if (showResult) {
                            if (isCorrect) {
                              bgClass = 'bg-primary/10 border border-primary/30';
                            } else if (isUserAnswer && !isCorrect) {
                              bgClass = 'bg-destructive/10 border border-destructive/30';
                            }
                          } else if (isUserAnswer) {
                            bgClass = 'bg-primary/10 border border-primary/30';
                          }

                          return (
                            <div 
                              key={optIndex}
                              className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${bgClass}`}
                            >
                              <RadioGroupItem 
                                value={optIndex.toString()} 
                                id={`q${index}-opt${optIndex}`}
                                disabled={submitted || !isComplete(mcq)}
                              />
                              <Label 
                                htmlFor={`q${index}-opt${optIndex}`} 
                                className="font-normal cursor-pointer flex-1"
                              >
                                {option || "..."}
                                {showResult && isCorrect && (
                                  <span className="ml-2 text-primary font-semibold">✓</span>
                                )}
                                {showResult && isUserAnswer && !isCorrect && (
                                  <span className="ml-2 text-destructive font-semibold">✗</span>
                                )}
                              </Label>
                            </div>
                          );
                        })}
                      </RadioGroup>

                      {submitted && isComplete(mcq) && (
                        <div className="pt-2 border-t border-border">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-semibold text-primary">Explanation:</span> {mcq.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}

                <Button
                  onClick={() => {
                    setGenerated(false);
                    setSubmitted(false);
                    setUserAnswers({});
                  }}
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

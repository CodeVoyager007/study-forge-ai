import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Save, ArrowLeft, CheckCircle, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";

interface TrueFalseQuestion {
  statement: string;
  isTrue: boolean;
  explanation: string;
}

const GenerateTrueFalse = () => {
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState([5]);
  const [difficulty, setDifficulty] = useState("medium");
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<TrueFalseQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: boolean | null }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic to generate True/False questions",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setGenerated(true);
    setQuestions([]);
    setUserAnswers({});
    setSubmitted(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-true-false`,
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
        throw new Error(errorText || "Failed to generate True/False questions");
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
                  const partialQuestions = functionCall.args.questions || [];
                  setQuestions(currentQuestions => [...currentQuestions, ...partialQuestions]);
                }
              }
            } catch (e) {
              // Incomplete JSON
            }
          }
        }
      }
      
      toast({
        title: "True/False Questions Generated!",
        description: `Finished creating questions on ${topic}`,
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate True/False questions",
        variant: "destructive",
      });
      setGenerated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (Object.keys(userAnswers).length !== questions.length) {
      toast({
        title: "Incomplete",
        description: "Please answer all questions",
        variant: "destructive",
      });
      return;
    }

    let correctCount = 0;
    questions.forEach((q, index) => {
      if (userAnswers[index] === q.isTrue) correctCount++;
    });

    setScore(correctCount);
    setSubmitted(true);

    toast({
      title: "Submitted!",
      description: `Score: ${correctCount}/${questions.length}`,
    });
  };

  const handleSave = async () => {
    if (!questions.length) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("generated_materials").insert([
        {
          user_id: user.id,
          title: `True/False Quiz: ${topic}`,
          type: "true-false-quiz",
          difficulty,
          content: { questions, userAnswers, score } as any,
          metadata: { topic, numQuestions: numQuestions[0] } as any,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Saved Successfully",
        description: "True/False quiz saved to your dashboard",
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
              <span className="gradient-text">True/False Quiz Generator</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Generate true/false questions with explanations for quick self-assessment
            </p>
          </div>

          {!generated ? (
            <Card className="p-8 bg-card/60 backdrop-blur-md border-2 border-border/50 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Biology Basics, World Geography, History Facts..."
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
                    min={3}
                    max={20}
                    step={1}
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
                    Generate Questions
                  </>
                )}
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Your True/False Quiz</h2>
                  {submitted && (
                    <p className="text-lg text-muted-foreground mt-1">
                      Score: <span className="text-primary font-semibold">{score}/{questions.length}</span>
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  {!submitted && !loading && questions.every(q => q.statement && typeof q.isTrue === 'boolean') && (
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

              {questions.map((q, index) => (
                <Card key={index} className="p-6 bg-card border-border">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Question {index + 1}: {q.statement}
                    </h3>
                    
                    <RadioGroup
                      value={userAnswers[index]?.toString()}
                      onValueChange={(value) => {
                        if (!submitted) {
                          setUserAnswers(prev => ({ ...prev, [index]: value === "true" }));
                        }
                      }}
                      disabled={submitted}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id={`q${index}-true`} />
                          <Label htmlFor={`q${index}-true`} className="font-normal cursor-pointer">True</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id={`q${index}-false`} />
                          <Label htmlFor={`q${index}-false`} className="font-normal cursor-pointer">False</Label>
                        </div>
                      </div>
                    </RadioGroup>

                    {submitted && (
                      <div className="pt-2 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                          {userAnswers[index] === q.isTrue ? (
                            <span className="text-primary font-semibold flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" /> Correct!
                            </span>
                          ) : (
                            <span className="text-destructive font-semibold flex items-center gap-1">
                              <HelpCircle className="h-4 w-4" /> Incorrect. Correct Answer: {q.isTrue ? "True" : "False"}
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="font-semibold text-primary">Explanation:</span> {q.explanation}
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
                Generate New Quiz
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateTrueFalse;

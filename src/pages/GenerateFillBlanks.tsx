import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Save, ArrowLeft, Edit3, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Slider } from "@/components/ui/slider";

interface FillInTheBlankItem {
  sentence: string;
  blanks: {
    index: number; // position of the blank in the sentence parts array
    correctAnswer: string;
    userAnswer?: string;
  }[];
}

const GenerateFillBlanks = () => {
  const [sourceText, setSourceText] = useState("");
  const [numBlanks, setNumBlanks] = useState([5]);
  const [difficulty, setDifficulty] = useState("medium");
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fillBlanksExercise, setFillBlanksExercise] = useState<FillInTheBlankItem[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [sentenceIndex: number]: { [blankIndex: number]: string } }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!sourceText.trim()) {
      toast({
        title: "Source Text Required",
        description: "Please provide text to generate fill-in-the-blank questions",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setGenerated(true);
    setFillBlanksExercise([]);
    setUserAnswers({});
    setSubmitted(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-fill-blanks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            sourceText: sourceText.trim(),
            numBlanks: numBlanks[0],
            difficulty,
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
        throw new Error(errorText || "Failed to generate fill-in-the-blanks");
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
                  const partialExercise = functionCall.args.fillBlanksExercise || [];
                  setFillBlanksExercise(prev => [...prev, ...partialExercise]);
                }
              }
            } catch (e) {
              // Incomplete JSON
            }
          }
        }
      }
      
      toast({
        title: "Fill-in-the-Blanks Generated!",
        description: `Finished creating exercises`,
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate fill-in-the-blanks",
        variant: "destructive",
      });
      setGenerated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAnswerChange = (sentenceIndex: number, blankIndex: number, value: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [sentenceIndex]: {
        ...prev[sentenceIndex],
        [blankIndex]: value,
      },
    }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    fillBlanksExercise.forEach((sentence, sentenceIndex) => {
      sentence.blanks.forEach(blank => {
        const userAnswer = userAnswers[sentenceIndex]?.[blank.index];
        if (userAnswer && userAnswer.toLowerCase() === blank.correctAnswer.toLowerCase()) {
          correctCount++;
        }
      });
    });

    setScore(correctCount);
    setSubmitted(true);

    toast({
      title: "Submitted!",
      description: `Score: ${correctCount} correct answers`,
    });
  };

  const handleSave = async () => {
    if (!fillBlanksExercise.length) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("generated_materials").insert([
        {
          user_id: user.id,
          title: `Fill-in-the-Blank: ${sourceText.substring(0, 50)}...`,
          type: "fill-blanks",
          difficulty,
          content: { fillBlanksExercise, userAnswers, score } as any,
          metadata: { numBlanks: numBlanks[0] } as any,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Saved Successfully",
        description: "Fill-in-the-Blank exercise saved to your dashboard",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const renderSentenceWithBlanks = (sentence: string, blanks: FillInTheBlankItem['blanks'], sentenceIndex: number) => {
    const parts = sentence.split("___");
    return parts.map((part, partIndex) => {
      const blank = blanks.find(b => b.index === partIndex - 1);
      if (blank) {
        const userAnswer = userAnswers[sentenceIndex]?.[blank.index] || "";
        const isCorrect = submitted && userAnswer.toLowerCase() === blank.correctAnswer.toLowerCase();
        const inputClassName = `border-b-2 ${submitted ? (isCorrect ? 'border-primary text-primary' : 'border-destructive text-destructive') : 'border-muted-foreground focus:border-primary'} outline-none px-1 w-24 text-center`;
        
        return (
          <span key={partIndex} className="inline-flex items-baseline">
            {part}
            <Input
              type="text"
              value={submitted ? (isCorrect ? blank.correctAnswer : userAnswer) : userAnswer}
              onChange={(e) => handleUserAnswerChange(sentenceIndex, blank.index, e.target.value)}
              disabled={submitted}
              className={inputClassName}
            />
          </span>
        );
      }
      return <span key={partIndex}>{part}</span>;
    });
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
              <span className="gradient-text">Fill-in-the-Blank Generator</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Create cloze deletion exercises from any text
            </p>
          </div>

          {!generated ? (
            <Card className="p-8 bg-card/60 backdrop-blur-md border-2 border-border/50 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sourceText">Source Text</Label>
                  <Textarea
                    id="sourceText"
                    placeholder="Paste the text you want to use for the exercise..."
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    className="bg-background min-h-64"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Number of Blanks: {numBlanks[0]}</Label>
                  <Slider
                    value={numBlanks}
                    onValueChange={setNumBlanks}
                    min={1}
                    max={15}
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
                    Generate Blanks
                  </>
                )}
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Your Fill-in-the-Blanks</h2>
                  {submitted && (
                    <p className="text-lg text-muted-foreground mt-1">
                      Score: <span className="text-primary font-semibold">{score} correct answers</span>
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  {!submitted && !loading && (
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

              {fillBlanksExercise.map((item, sentenceIndex) => (
                <Card key={sentenceIndex} className="p-6 bg-card border-border">
                  <p className="text-lg leading-relaxed">
                    {renderSentenceWithBlanks(item.sentence, item.blanks, sentenceIndex)}
                  </p>
                </Card>
              ))}

              <Button
                onClick={() => { setGenerated(false); setFillBlanksExercise([]); setUserAnswers({}); setSubmitted(false); }}
                variant="outline"
                className="w-full"
              >
                Generate New Exercise
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateFillBlanks;

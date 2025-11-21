import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, BookOpen, Volume2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";

const GenerateVocabulary = () => {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [count, setCount] = useState("20");
  const [loading, setLoading] = useState(false);
  const [vocabulary, setVocabulary] = useState<any[]>([]);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setVocabulary([]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-vocabulary`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ topic, difficulty, count: parseInt(count) }),
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
                  setVocabulary(prev => [...prev, ...(functionCall.args.words || [])]);
                }
              }
            } catch (e) {
              // Incomplete JSON
            }
          }
        }
      }
      
      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('generated_materials').insert({
          user_id: user.id,
          type: 'vocabulary',
          title: `Vocabulary: ${topic}`,
          content: { words: vocabulary },
          difficulty,
          metadata: { topic, count: parseInt(count) }
        });
      }

      toast({
        title: "Success",
        description: "Vocabulary list generated successfully!",
      });

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate vocabulary",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4 animate-fade-in-down">
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
              Build your vocabulary with spaced repetition
            </p>
          </div>

          <Card className="p-8 card-elegant border-border/50 animate-scale-in">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic or Subject</Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Business English, Medical Terms, SAT Vocabulary"
                  className="bg-background/50 border-border/50 focus:border-primary"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Difficulty Level</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Number of Words</Label>
                  <Select value={count} onValueChange={setCount}>
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 words</SelectItem>
                      <SelectItem value="20">20 words</SelectItem>
                      <SelectItem value="30">30 words</SelectItem>
                      <SelectItem value="50">50 words</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow-lg transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Generate Vocabulary
                  </>
                )}
              </Button>
            </div>
          </Card>

          {vocabulary.length > 0 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-2xl font-bold">Your Vocabulary List</h2>
              <div className="grid gap-4">
                {vocabulary.map((word: any, index: number) => (
                  <Card key={index} className="p-6 card-elegant border-border/50 card-hover">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h3 className="text-2xl font-bold gradient-text-secondary">{word.word}</h3>
                          <span className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                            {word.partOfSpeech || word.part_of_speech}
                          </span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <p className="text-foreground">{word.definition}</p>
                      
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="font-semibold text-muted-foreground">Example: </span>
                          <span className="italic">{word.example || word.exampleSentence || word.example_sentence}</span>
                        </p>
                        
                        {(word.synonyms && word.synonyms.length > 0) && (
                          <p className="text-sm">
                            <span className="font-semibold text-muted-foreground">Synonyms: </span>
                            {word.synonyms.join(', ')}
                          </p>
                        )}
                        
                        {(word.memoryTip || word.memory_tip) && (
                          <div className="mt-3 p-3 rounded-lg bg-accent/10 border border-accent/20">
                            <p className="text-sm">
                              <span className="font-semibold text-accent">💡 Memory Tip: </span>
                              {word.memoryTip || word.memory_tip}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateVocabulary;

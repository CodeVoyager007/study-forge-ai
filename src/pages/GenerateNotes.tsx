import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Save, ArrowLeft, FileText, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ConvertedNote {
  title: string;
  content: string; // Markdown formatted
  tags?: string[];
}

const GenerateNotes = () => {
  const [rawNotes, setRawNotes] = useState("");
  const [desiredFormat, setDesiredFormat] = useState("structured");
  const [topic, setTopic] = useState("");
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [convertedNote, setConvertedNote] = useState<Partial<ConvertedNote>>({});
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!rawNotes.trim()) {
      toast({
        title: "Notes Required",
        description: "Please paste your raw notes to convert",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setGenerated(true);
    setConvertedNote({});

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/convert-notes`, // Assuming a function for this
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            rawNotes: rawNotes.trim(),
            desiredFormat,
            topic: topic.trim(),
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
        throw new Error(errorText || "Failed to convert notes");
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
                  setConvertedNote(prev => {
                    const newNote = { ...prev };
                    const args = functionCall.args;
                    if (args.title) newNote.title = args.title;
                    if (args.content) newNote.content = (newNote.content || "") + args.content;
                    if (args.tags) newNote.tags = [...(newNote.tags || []), ...args.tags];
                    return newNote;
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
        title: "Notes Converted!",
        description: `Finished converting notes on ${topic}`,
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to convert notes",
        variant: "destructive",
      });
      setGenerated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!convertedNote?.title || !convertedNote?.content) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("generated_materials").insert([
        {
          user_id: user.id,
          title: `Notes: ${convertedNote.title}`,
          type: "notes",
          content: { convertedNote } as any,
          metadata: { topic, desiredFormat } as any,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Saved Successfully",
        description: "Converted notes saved to your dashboard",
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
              <span className="gradient-text">Notes Converter</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Organize and convert your messy lecture notes into structured formats
            </p>
          </div>

          {!generated ? (
            <Card className="p-8 bg-card/60 backdrop-blur-md border-2 border-border/50 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rawNotes">Raw Notes (Paste Here)</Label>
                  <Textarea
                    id="rawNotes"
                    placeholder="Paste your unorganized notes here..."
                    value={rawNotes}
                    onChange={(e) => setRawNotes(e.target.value)}
                    className="bg-background min-h-64"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Topic (Optional)</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Photosynthesis, Napoleonic Wars"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Desired Format</Label>
                  <RadioGroup value={desiredFormat} onValueChange={setDesiredFormat}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="structured" id="format-structured" />
                      <Label htmlFor="format-structured" className="font-normal cursor-pointer">Structured (headings, bullet points)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="summarized" id="format-summarized" />
                      <Label htmlFor="format-summarized" className="font-normal cursor-pointer">Summarized Paragraphs</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="flashcards" id="format-flashcards" />
                      <Label htmlFor="format-flashcards" className="font-normal cursor-pointer">Flashcards (extract key concepts)</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-glow shadow-lg hover:shadow-primary/50 transition-all h-12"
              >
                {loading ? (
                  "Converting..."
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Convert Notes
                  </>
                )}
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Converted Notes</h2>
                {!loading && (
                  <Button onClick={handleSave} variant="outline">
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                )}
              </div>

              <Card className="p-8 bg-card border-border space-y-4">
                <h3 className="text-2xl font-bold">{convertedNote.title || "Untitled Notes"}</h3>
                
                {convertedNote.content && (
                  <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: convertedNote.content }} />
                )}
                
                {convertedNote.tags && convertedNote.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-border mt-4">
                    {convertedNote.tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 text-sm rounded-full bg-secondary/20 text-secondary-foreground border border-secondary/30">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Card>

              <Button
                onClick={() => { setGenerated(false); setConvertedNote({}); }}
                variant="outline"
                className="w-full"
              >
                Convert New Notes
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateNotes;

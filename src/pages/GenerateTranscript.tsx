import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Save, ArrowLeft, Youtube, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface TranscriptSummary {
  title: string;
summary: string;
  timestamps?: { time: string; text: string }[];
  keywords?: string[];
}

const GenerateTranscript = () => {
  const [source, setSource] = useState("youtube"); // 'youtube' or 'text'
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [rawTranscript, setRawTranscript] = useState("");
  const [length, setLength] = useState("medium"); // 'short', 'medium', 'long'
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transcriptSummary, setTranscriptSummary] = useState<Partial<TranscriptSummary>>({});
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (source === "youtube" && !youtubeUrl.trim()) {
      toast({
        title: "YouTube URL Required",
        description: "Please enter a YouTube video URL",
        variant: "destructive",
      });
      return;
    }
    if (source === "text" && !rawTranscript.trim()) {
      toast({
        title: "Transcript Required",
        description: "Please paste the raw transcript text",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setGenerated(true);
    setTranscriptSummary({});

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const requestBody: any = { length };
      if (source === "youtube") {
        requestBody.youtubeUrl = youtubeUrl.trim();
      } else {
        requestBody.transcriptText = rawTranscript.trim();
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/summarize-transcript`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(requestBody),
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
        throw new Error(errorText || "Failed to summarize transcript");
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
                  setTranscriptSummary(prev => {
                    const newSummary = { ...prev };
                    const args = functionCall.args;
                    if (args.title) newSummary.title = args.title;
                    if (args.summary) newSummary.summary = (newSummary.summary || "") + args.summary;
                    if (args.timestamps) newSummary.timestamps = [...(newSummary.timestamps || []), ...args.timestamps];
                    if (args.keywords) newSummary.keywords = [...(newSummary.keywords || []), ...args.keywords];
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
        title: "Transcript Summarized!",
        description: `Finished summarizing content`,
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to summarize transcript",
        variant: "destructive",
      });
      setGenerated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!transcriptSummary?.title || !transcriptSummary?.summary) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("generated_materials").insert([
        {
          user_id: user.id,
          title: `Transcript Summary: ${transcriptSummary.title}`,
          type: "transcript-summary",
          content: { transcriptSummary } as any,
          metadata: { source, youtubeUrl, length } as any,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Saved Successfully",
        description: "Transcript summary saved to your dashboard",
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
              <span className="gradient-text">Transcript Summarizer</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Summarize YouTube videos or raw text transcripts with timestamps
            </p>
          </div>

          {!generated ? (
            <Card className="p-8 bg-card/60 backdrop-blur-md border-2 border-border/50 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Source</Label>
                  <RadioGroup value={source} onValueChange={setSource} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="youtube" id="source-youtube" />
                      <Label htmlFor="source-youtube" className="font-normal cursor-pointer flex items-center gap-1">
                        <Youtube className="h-4 w-4" /> YouTube URL
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="text" id="source-text" />
                      <Label htmlFor="source-text" className="font-normal cursor-pointer flex items-center gap-1">
                        <FileText className="h-4 w-4" /> Raw Transcript Text
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {source === "youtube" ? (
                  <div className="space-y-2">
                    <Label htmlFor="youtubeUrl">YouTube Video URL</Label>
                    <Input
                      id="youtubeUrl"
                      placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="rawTranscript">Raw Transcript Text</Label>
                    <Textarea
                      id="rawTranscript"
                      placeholder="Paste your transcript text here..."
                      value={rawTranscript}
                      onChange={(e) => setRawTranscript(e.target.value)}
                      className="bg-background min-h-64"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Summary Length</Label>
                  <RadioGroup value={length} onValueChange={setLength} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="short" id="length-short" />
                      <Label htmlFor="length-short" className="font-normal cursor-pointer">Short</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="length-medium" />
                      <Label htmlFor="length-medium" className="font-normal cursor-pointer">Medium</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="long" id="length-long" />
                      <Label htmlFor="length-long" className="font-normal cursor-pointer">Long</Label>
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
                  "Summarizing..."
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Summarize Transcript
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
                <h3 className="text-2xl font-bold">{transcriptSummary.title || "Untitled Summary"}</h3>
                
                {transcriptSummary.summary && (
                  <div className="prose prose-invert max-w-none">
                    <p className="mb-4 text-foreground/90 leading-relaxed">
                      {transcriptSummary.summary}
                    </p>
                  </div>
                )}

                {transcriptSummary.timestamps && transcriptSummary.timestamps.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border mt-4">
                    <h4 className="font-semibold text-lg mb-2">Key Timestamps</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {transcriptSummary.timestamps.map((ts, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">
                          <span className="font-semibold text-primary">{ts.time}:</span> {ts.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {transcriptSummary.keywords && transcriptSummary.keywords.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border mt-4">
                    <h4 className="font-semibold text-lg mb-2">Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {transcriptSummary.keywords.map((keyword, idx) => (
                        <span key={idx} className="px-3 py-1 text-sm rounded-full bg-secondary/20 text-secondary-foreground border border-secondary/30">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              <Button
                onClick={() => { setGenerated(false); setTranscriptSummary({}); }}
                variant="outline"
                className="w-full"
              >
                Summarize New Transcript
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateTranscript;

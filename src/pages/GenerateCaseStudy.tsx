import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Save, ArrowLeft, Lightbulb, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AnalysisSection {
  heading: string;
  content: string;
}

interface CaseStudyAnalysis {
  title: string;
  summary: string;
  sections: AnalysisSection[];
  recommendations?: string[];
  keywords?: string[];
}

const GenerateCaseStudy = () => {
  const [caseStudyText, setCaseStudyText] = useState("");
  const [analysisType, setAnalysisType] = useState("business"); // 'business', 'medical', 'legal'
  const [focusArea, setFocusArea] = useState(""); // e.g., 'marketing strategy', 'diagnosis'
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [caseStudyAnalysis, setCaseStudyAnalysis] = useState<Partial<CaseStudyAnalysis>>({});
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!caseStudyText.trim()) {
      toast({
        title: "Case Study Required",
        description: "Please paste the case study text",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setGenerated(true);
    setCaseStudyAnalysis({});

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-case-study`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            caseStudyText: caseStudyText.trim(),
            analysisType,
            focusArea: focusArea.trim(),
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
        throw new Error(errorText || "Failed to analyze case study");
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
                  setCaseStudyAnalysis(prev => {
                    const newAnalysis = { ...prev };
                    const args = functionCall.args;
                    if (args.title) newAnalysis.title = args.title;
                    if (args.summary) newAnalysis.summary = (newAnalysis.summary || "") + args.summary;
                    if (args.sections) newAnalysis.sections = [...(newAnalysis.sections || []), ...args.sections];
                    if (args.recommendations) newAnalysis.recommendations = [...(newAnalysis.recommendations || []), ...args.recommendations];
                    if (args.keywords) newAnalysis.keywords = [...(newAnalysis.keywords || []), ...args.keywords];
                    return newAnalysis;
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
        title: "Case Study Analyzed!",
        description: `Finished analyzing the case study`,
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to analyze case study",
        variant: "destructive",
      });
      setGenerated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!caseStudyAnalysis?.title || !caseStudyAnalysis?.summary) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("generated_materials").insert([
        {
          user_id: user.id,
          title: `Case Study Analysis: ${caseStudyAnalysis.title}`,
          type: "case-study-analysis",
          content: { caseStudyAnalysis } as any,
          metadata: { analysisType, focusArea } as any,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Saved Successfully",
        description: "Case study analysis saved to your dashboard",
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
              <span className="gradient-text">Case Study Analyzer</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Analyze business and medical case studies with AI-powered insights
            </p>
          </div>

          {!generated ? (
            <Card className="p-8 bg-card/60 backdrop-blur-md border-2 border-border/50 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="caseStudyText">Case Study Text (Paste Here)</Label>
                  <Textarea
                    id="caseStudyText"
                    placeholder="Paste your case study content here..."
                    value={caseStudyText}
                    onChange={(e) => setCaseStudyText(e.target.value)}
                    className="bg-background min-h-64"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Analysis Type</Label>
                  <RadioGroup value={analysisType} onValueChange={setAnalysisType} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="business" id="type-business" />
                      <Label htmlFor="type-business" className="font-normal cursor-pointer">Business</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medical" id="type-medical" />
                      <Label htmlFor="type-medical" className="font-normal cursor-pointer">Medical</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="legal" id="type-legal" />
                      <Label htmlFor="type-legal" className="font-normal cursor-pointer">Legal</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="focusArea">Focus Area (Optional)</Label>
                  <Input
                    id="focusArea"
                    placeholder="e.g., Marketing Strategy, Patient Diagnosis, Contract Clause"
                    value={focusArea}
                    onChange={(e) => setFocusArea(e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-glow shadow-lg hover:shadow-primary/50 transition-all h-12"
              >
                {loading ? (
                  "Analyzing..."
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Analyze Case Study
                  </>
                )}
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Case Study Analysis</h2>
                {!loading && (
                  <Button onClick={handleSave} variant="outline">
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                )}
              </div>

              <Card className="p-8 bg-card border-border space-y-4">
                <h3 className="text-2xl font-bold">{caseStudyAnalysis.title || "Untitled Analysis"}</h3>
                
                {caseStudyAnalysis.summary && (
                  <div className="prose prose-invert max-w-none">
                    <p className="mb-4 text-foreground/90 leading-relaxed">
                      {caseStudyAnalysis.summary}
                    </p>
                  </div>
                )}

                {caseStudyAnalysis.sections && caseStudyAnalysis.sections.length > 0 && (
                  <div className="space-y-4 pt-4">
                    {caseStudyAnalysis.sections.map((section, idx) => (
                      <div key={idx} className="space-y-2">
                        <h4 className="font-semibold text-lg text-primary">{section.heading}</h4>
                        <p className="text-muted-foreground">{section.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {caseStudyAnalysis.recommendations && caseStudyAnalysis.recommendations.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border mt-4">
                    <h4 className="font-semibold text-lg mb-2">Recommendations</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {caseStudyAnalysis.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {caseStudyAnalysis.keywords && caseStudyAnalysis.keywords.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border mt-4">
                    <h4 className="font-semibold text-lg mb-2">Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {caseStudyAnalysis.keywords.map((keyword, idx) => (
                        <span key={idx} className="px-3 py-1 text-sm rounded-full bg-secondary/20 text-secondary-foreground border border-secondary/30">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              <Button
                onClick={() => { setGenerated(false); setCaseStudyAnalysis({}); }}
                variant="outline"
                className="w-full"
              >
                Analyze New Case Study
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateCaseStudy;

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sparkles, Save, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const GenerateFormulas = () => {
  const [subject, setSubject] = useState("physics");
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setGenerated(true);
      setLoading(false);
      toast({
        title: "Formula Sheet Generated!",
        description: `Created formula sheet for ${subject}`,
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
              <span className="gradient-text">Formula Sheet Generator</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Get subject-specific formulas with explanations and examples
            </p>
          </div>

          {!generated ? (
            <Card className="p-8 bg-card border-border space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <RadioGroup value={subject} onValueChange={setSubject}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="physics" id="physics" />
                      <Label htmlFor="physics" className="font-normal cursor-pointer">Physics</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="chemistry" id="chemistry" />
                      <Label htmlFor="chemistry" className="font-normal cursor-pointer">Chemistry</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mathematics" id="mathematics" />
                      <Label htmlFor="mathematics" className="font-normal cursor-pointer">Mathematics</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="statistics" id="statistics" />
                      <Label htmlFor="statistics" className="font-normal cursor-pointer">Statistics</Label>
                    </div>
                  </RadioGroup>
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
                    Generate Formula Sheet
                  </>
                )}
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Formula Sheet</h2>
                <Button variant="outline">
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>

              <Card className="p-8 bg-card border-border">
                <p className="text-muted-foreground">Formula sheet content will appear here.</p>
              </Card>

              <Button onClick={() => setGenerated(false)} variant="outline" className="w-full">
                Generate New Sheet
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateFormulas;

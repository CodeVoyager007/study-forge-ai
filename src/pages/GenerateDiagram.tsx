import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sparkles, Save, ArrowLeft, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const GenerateDiagram = () => {
  const [topic, setTopic] = useState("");
  const [diagramType, setDiagramType] = useState("flowchart");
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for your diagram",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setGenerated(true);
      setLoading(false);
      toast({
        title: "Diagram Generated!",
        description: `Created ${diagramType} for ${topic}`,
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
              <span className="gradient-text">Diagram Generator</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Create flowcharts, timelines, Venn diagrams, and more
            </p>
          </div>

          {!generated ? (
            <Card className="p-8 bg-card border-border space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic or Process</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Water Cycle, Decision Making Process..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Diagram Type</Label>
                  <RadioGroup value={diagramType} onValueChange={setDiagramType}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="flowchart" id="flowchart" />
                      <Label htmlFor="flowchart" className="font-normal cursor-pointer">Flowchart</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="venn" id="venn" />
                      <Label htmlFor="venn" className="font-normal cursor-pointer">Venn Diagram</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="timeline" id="timeline" />
                      <Label htmlFor="timeline" className="font-normal cursor-pointer">Timeline</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="process" id="process" />
                      <Label htmlFor="process" className="font-normal cursor-pointer">Process Diagram</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="comparison" id="comparison" />
                      <Label htmlFor="comparison" className="font-normal cursor-pointer">Comparison Chart</Label>
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
                    Generate Diagram
                  </>
                )}
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Diagram</h2>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export PNG
                  </Button>
                  <Button variant="outline">
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
              </div>

              <Card className="p-8 bg-card border-border min-h-96 flex items-center justify-center">
                <p className="text-muted-foreground">Diagram visualization will appear here after AI generation is implemented.</p>
              </Card>

              <Button onClick={() => setGenerated(false)} variant="outline" className="w-full">
                Generate New Diagram
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateDiagram;

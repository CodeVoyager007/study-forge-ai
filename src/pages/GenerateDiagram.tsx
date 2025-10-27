import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Network, Download, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";

const GenerateDiagram = () => {
  const [topic, setTopic] = useState("");
  const [diagramType, setDiagramType] = useState("flowchart");
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [diagram, setDiagram] = useState<any>(null);
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
    try {
      const { data, error } = await supabase.functions.invoke('generate-diagram', {
        body: { topic, type: diagramType, difficulty }
      });

      if (error) throw error;

      const parsedContent = JSON.parse(data.content);
      setDiagram(parsedContent);

      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('generated_materials').insert({
          user_id: user.id,
          type: 'diagram',
          title: `${diagramType}: ${topic}`,
          content: parsedContent,
          difficulty,
          metadata: { topic, diagramType }
        });
      }

      toast({
        title: "Success",
        description: "Diagram generated successfully!",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate diagram",
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
              <span className="gradient-text">Diagram Generator</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Create flowcharts, timelines, and visual diagrams
            </p>
          </div>

          <Card className="p-8 card-elegant border-border/50 animate-scale-in">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Water Cycle, Project Management Process"
                  className="bg-background/50 border-border/50 focus:border-primary"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Diagram Type</Label>
                  <Select value={diagramType} onValueChange={setDiagramType}>
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flowchart">Flowchart</SelectItem>
                      <SelectItem value="timeline">Timeline</SelectItem>
                      <SelectItem value="venn">Venn Diagram</SelectItem>
                      <SelectItem value="mind-map">Mind Map</SelectItem>
                      <SelectItem value="concept-map">Concept Map</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                    <Network className="mr-2 h-4 w-4" />
                    Generate Diagram
                  </>
                )}
              </Button>
            </div>
          </Card>

          {diagram && (
            <Card className="p-8 card-elegant border-border/50 animate-fade-in">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">{diagram.title}</h2>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>

                <p className="text-muted-foreground">{diagram.description}</p>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Elements</h3>
                  <div className="grid gap-4">
                    {diagram.elements?.map((element: any, index: number) => (
                      <Card key={index} className="p-4 bg-secondary/50">
                        <h4 className="font-semibold mb-2">{element.name || element.label}</h4>
                        <p className="text-sm text-muted-foreground">{element.description}</p>
                      </Card>
                    ))}
                  </div>
                </div>

                {diagram.connections && diagram.connections.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Connections</h3>
                    <div className="space-y-2">
                      {diagram.connections.map((conn: any, index: number) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          {conn.from} → {conn.to}: {conn.relationship || conn.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateDiagram;

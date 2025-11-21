import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Save, ArrowLeft, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ScheduleEntry {
  day: string;
  time: string;
  activity: string;
  subject: string;
}

interface StudySchedule {
  title: string;
  description: string;
  schedule: ScheduleEntry[];
}

const GenerateSchedule = () => {
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("1 week");
  const [daysAvailable, setDaysAvailable] = useState("5 days");
  const [subjects, setSubjects] = useState("");
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [studySchedule, setStudySchedule] = useState<Partial<StudySchedule>>({});
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim() || !subjects.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a topic and subjects for the schedule",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setGenerated(true);
    setStudySchedule({});

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-schedule`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            topic: topic.trim(),
            duration,
            daysAvailable,
            subjects: subjects.split(',').map(s => s.trim()),
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
        throw new Error(errorText || "Failed to generate Study Schedule");
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
                  setStudySchedule(prev => {
                    const newSchedule = { ...prev };
                    const args = functionCall.args;
                    if (args.title) newSchedule.title = args.title;
                    if (args.description) newSchedule.description = (newSchedule.description || "") + args.description;
                    if (args.schedule) newSchedule.schedule = [...(newSchedule.schedule || []), ...args.schedule];
                    return newSchedule;
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
        title: "Study Schedule Generated!",
        description: `Finished creating a schedule for ${topic}`,
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate Study Schedule",
        variant: "destructive",
      });
      setGenerated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!studySchedule?.title || !studySchedule?.schedule?.length) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("generated_materials").insert([
        {
          user_id: user.id,
          title: `Study Schedule: ${topic}`,
          type: "study-schedule",
          content: { studySchedule } as any,
          metadata: { topic, duration, daysAvailable, subjects } as any,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Saved Successfully",
        description: "Study Schedule saved to your dashboard",
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
              <span className="gradient-text">Study Schedule Generator</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Generate a personalized study timeline planner
            </p>
          </div>

          {!generated ? (
            <Card className="p-8 bg-card/60 backdrop-blur-md border-2 border-border/50 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Main Topic/Goal</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Exam Prep, Learning a New Language..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subjects">Subjects to Include (comma-separated)</Label>
                  <Textarea
                    id="subjects"
                    placeholder="e.g., Math, Science, History, English"
                    value={subjects}
                    onChange={(e) => setSubjects(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Study Duration</Label>
                  <RadioGroup value={duration} onValueChange={setDuration}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1 week" id="duration-1w" />
                      <Label htmlFor="duration-1w" className="font-normal cursor-pointer">1 Week</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2 weeks" id="duration-2w" />
                      <Label htmlFor="duration-2w" className="font-normal cursor-pointer">2 Weeks</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1 month" id="duration-1m" />
                      <Label htmlFor="duration-1m" className="font-normal cursor-pointer">1 Month</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="custom" id="duration-custom" />
                      <Label htmlFor="duration-custom" className="font-normal cursor-pointer">Custom</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Days Available for Study</Label>
                  <RadioGroup value={daysAvailable} onValueChange={setDaysAvailable}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="3 days" id="days-3" />
                      <Label htmlFor="days-3" className="font-normal cursor-pointer">3 Days/Week</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="5 days" id="days-5" />
                      <Label htmlFor="days-5" className="font-normal cursor-pointer">5 Days/Week</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="7 days" id="days-7" />
                      <Label htmlFor="days-7" className="font-normal cursor-pointer">7 Days/Week</Label>
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
                  "Generating..."
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Schedule
                  </>
                )}
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Study Schedule</h2>
                {!loading && (
                  <Button onClick={handleSave} variant="outline">
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                )}
              </div>

              <Card className="p-8 bg-card border-border space-y-4">
                <h3 className="text-2xl font-bold">{studySchedule.title || "Study Schedule"}</h3>
                {studySchedule.description && <p className="text-muted-foreground">{studySchedule.description}</p>}
                
                {studySchedule.schedule && studySchedule.schedule.length > 0 && (
                  <div className="space-y-4 pt-4">
                    {studySchedule.schedule.map((entry, index) => (
                      <Card key={index} className="p-4 bg-secondary/20 border-border flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{entry.day}: {entry.time}</p>
                          <p className="text-sm text-muted-foreground">{entry.activity} ({entry.subject})</p>
                        </div>
                        <CalendarDays className="h-5 w-5 text-muted-foreground" />
                      </Card>
                    ))}
                  </div>
                )}
              </Card>

              <Button
                onClick={() => { setGenerated(false); setStudySchedule({}); }}
                variant="outline"
                className="w-full"
              >
                Generate New Schedule
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateSchedule;

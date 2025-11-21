import { Card } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { StudySchedule } from "@/types/schedule";

interface ScheduleMaterialProps {
  studySchedule: StudySchedule;
}

const ScheduleMaterial = ({ studySchedule }: ScheduleMaterialProps) => {
  return (
    <div className="space-y-6">
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
    </div>
  );
};

export default ScheduleMaterial;

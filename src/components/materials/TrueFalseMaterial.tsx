import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, HelpCircle } from "lucide-react";
import { TrueFalseQuestion } from "@/types/true-false";

interface TrueFalseMaterialProps {
  questions: TrueFalseQuestion[];
  userAnswers?: { [key: number]: boolean | null }; // Optional, if saved
  score?: number; // Optional, if saved
}

const TrueFalseMaterial = ({ questions, userAnswers, score }: TrueFalseMaterialProps) => {
  const submitted = userAnswers && Object.keys(userAnswers).length === questions.length;

  return (
    <div className="space-y-6">
      {score !== undefined && (
        <Card>
          <CardHeader>
            <CardTitle>Your Score: {score}/{questions.length}</CardTitle>
          </CardHeader>
        </Card>
      )}

      {questions.map((q, index) => (
        <Card key={index} className="p-6 bg-card border-border">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Question {index + 1}: {q.statement}
            </h3>
            
            <RadioGroup
              value={userAnswers ? userAnswers[index]?.toString() : undefined}
              disabled // Always disabled for viewing saved material
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id={`q${index}-true`} />
                  <Label htmlFor={`q${index}-true`} className="font-normal">True</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id={`q${index}-false`} />
                  <Label htmlFor={`q${index}-false`} className="font-normal">False</Label>
                </div>
              </div>
            </RadioGroup>

            {submitted && (
              <div className="pt-2 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  {userAnswers[index] === q.isTrue ? (
                    <span className="text-primary font-semibold flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" /> Correct!
                    </span>
                  ) : (
                    <span className="text-destructive font-semibold flex items-center gap-1">
                      <HelpCircle className="h-4 w-4" /> Incorrect. Correct Answer: {q.isTrue ? "True" : "False"}
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-semibold text-primary">Explanation:</span> {q.explanation}
                </p>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default TrueFalseMaterial;

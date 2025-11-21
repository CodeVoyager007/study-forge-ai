import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { MCQ } from "@/types/mcq";

interface McqMaterialProps {
  mcqs: MCQ[];
  userAnswers?: { [key: number]: number }; // Optional, if saved
  score?: number; // Optional, if saved
}

const McqMaterial = ({ mcqs, userAnswers, score }: McqMaterialProps) => {
  const submitted = userAnswers && Object.keys(userAnswers).length === mcqs.length;

  return (
    <div className="space-y-6">
      {score !== undefined && (
        <Card>
          <CardHeader>
            <CardTitle>Your Score: {score}/{mcqs.length}</CardTitle>
          </CardHeader>
        </Card>
      )}

      {mcqs.map((mcq, index) => (
        <Card key={index} className="p-6 bg-card border-border">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Question {index + 1}: {mcq.question}
            </h3>

            <RadioGroup
              value={userAnswers ? userAnswers[index]?.toString() : undefined}
              disabled // Always disabled for viewing saved material
            >
              {(mcq.options || []).map((option, optIndex) => {
                const isUserAnswer = userAnswers && userAnswers[index] === optIndex;
                const isCorrect = optIndex === mcq.correct;
                const showResult = submitted;

                let bgClass = '';
                if (showResult) {
                  if (isCorrect) {
                    bgClass = 'bg-primary/10 border border-primary/30';
                  } else if (isUserAnswer && !isCorrect) {
                    bgClass = 'bg-destructive/10 border border-destructive/30';
                  }
                } else if (isUserAnswer) { // Highlight user's answer even if not submitted (e.g., for review)
                  bgClass = 'bg-primary/10 border border-primary/30';
                }

                return (
                  <div
                    key={optIndex}
                    className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${bgClass}`}
                  >
                    <RadioGroupItem
                      value={optIndex.toString()}
                      id={`q${index}-opt${optIndex}`}
                      disabled
                    />
                    <Label
                      htmlFor={`q${index}-opt${optIndex}`}
                      className="font-normal flex-1"
                    >
                      {option}
                      {showResult && isCorrect && (
                        <span className="ml-2 text-primary font-semibold">✓</span>
                      )}
                      {showResult && isUserAnswer && !isCorrect && (
                        <span className="ml-2 text-destructive font-semibold">✗</span>
                      )}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>

            {mcq.explanation && (
              <div className="pt-2 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">Explanation:</span> {mcq.explanation}
                </p>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default McqMaterial;

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FillInTheBlankItem } from "@/types/fill-blanks";
import { CheckCircle } from "lucide-react";

interface FillBlanksMaterialProps {
  fillBlanksExercise: FillInTheBlankItem[];
  userAnswers?: { [sentenceIndex: number]: { [blankIndex: number]: string } }; // Optional, if saved
  score?: number; // Optional, if saved
}

const FillBlanksMaterial = ({ fillBlanksExercise, userAnswers, score }: FillBlanksMaterialProps) => {
  const submitted = userAnswers !== undefined && score !== undefined;

  const renderSentenceWithBlanks = (item: FillInTheBlankItem, sentenceIndex: number) => {
    const parts = item.sentence.split("___");
    return parts.map((part, partIndex) => {
      const blank = item.blanks.find(b => b.index === partIndex - 1);
      if (blank) {
        const userAnswer = userAnswers?.[sentenceIndex]?.[blank.index] || "";
        const isCorrect = submitted && userAnswer.toLowerCase() === blank.correctAnswer.toLowerCase();
        
        return (
          <span key={partIndex} className="inline-flex items-baseline mx-1">
            {part}
            <Input
              type="text"
              value={submitted ? (isCorrect ? blank.correctAnswer : userAnswer) : userAnswer}
              disabled
              className={`border-b-2 ${submitted ? (isCorrect ? 'border-primary text-primary' : 'border-destructive text-destructive') : 'border-muted-foreground'} outline-none px-1 w-24 text-center`}
            />
            {submitted && !isCorrect && (
                <span className="ml-1 text-primary text-sm">({blank.correctAnswer})</span>
            )}
          </span>
        );
      }
      return <span key={partIndex}>{part}</span>;
    });
  };

  return (
    <div className="space-y-6">
      {submitted && score !== undefined && (
        <Card>
          <CardHeader>
            <CardTitle>Your Score: {score} correct answers</CardTitle>
          </CardHeader>
        </Card>
      )}

      {fillBlanksExercise.map((item, sentenceIndex) => (
        <Card key={sentenceIndex} className="p-6 bg-card border-border">
          <p className="text-lg leading-relaxed">
            {renderSentenceWithBlanks(item, sentenceIndex)}
          </p>
        </Card>
      ))}
    </div>
  );
};

export default FillBlanksMaterial;

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { RotateCw } from "lucide-react";
import { Flashcard } from "@/types/flashcard";

interface FlashcardMaterialProps {
  flashcards: Flashcard[];
}

const FlashcardMaterial = ({ flashcards }: FlashcardMaterialProps) => {
  const [flipped, setFlipped] = useState<number[]>([]);

  const isComplete = (card: Flashcard) => {
    return card.front && card.back;
  };

  const toggleFlip = (index: number) => {
    setFlipped(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {flashcards.map((card, index) => (
        <div
          key={index}
          onClick={() => isComplete(card) && toggleFlip(index)}
          className="cursor-pointer perspective-1000"
        >
          <Card
            className={`p-8 h-64 flex flex-col items-center justify-center text-center bg-gradient-to-br transition-all duration-300 ${
              flipped.includes(index)
                ? 'from-primary/20 to-primary-glow/20 border-primary/50'
                : 'from-card to-secondary border-border'
            } hover:border-primary/50 card-hover`}
          >
            <div className="space-y-4">
              {!isComplete(card) ? <p>Loading...</p> : (
                <>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <RotateCw className="h-4 w-4" />
                    <span>Click to flip</span>
                  </div>
                  <p className="text-lg font-medium">
                    {flipped.includes(index) ? card.back : card.front}
                  </p>
                </>
              )}
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default FlashcardMaterial;

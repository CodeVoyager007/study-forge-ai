import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { VocabularyWord } from "@/types/vocabulary";

interface VocabularyMaterialProps {
  words: VocabularyWord[];
}

const VocabularyMaterial = ({ words }: VocabularyMaterialProps) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-2xl font-bold">Your Vocabulary List</h2>
      <div className="grid gap-4">
        {words.map((word, index) => (
          <Card key={index} className="p-6 card-elegant border-border/50 card-hover">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold gradient-text-secondary">{word.word}</h3>
                  <span className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {word.partOfSpeech || word.part_of_speech}
                  </span>
                </div>
                <Button variant="ghost" size="sm">
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-foreground">{word.definition}</p>

              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-semibold text-muted-foreground">Example: </span>
                  <span className="italic">{word.example || word.exampleSentence || word.example_sentence}</span>
                </p>

                {(word.synonyms && word.synonyms.length > 0) && (
                  <p className="text-sm">
                    <span className="font-semibold text-muted-foreground">Synonyms: </span>
                    {word.synonyms.join(', ')}
                  </p>
                )}

                {(word.memoryTip || word.memory_tip) && (
                  <div className="mt-3 p-3 rounded-lg bg-accent/10 border border-accent/20">
                    <p className="text-sm">
                      <span className="font-semibold text-accent">💡 Memory Tip: </span>
                      {word.memoryTip || word.memory_tip}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VocabularyMaterial;

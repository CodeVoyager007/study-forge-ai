import { Card } from "@/components/ui/card";
import { ConvertedNote } from "@/types/notes";

interface NotesMaterialProps {
  convertedNote: ConvertedNote;
}

const NotesMaterial = ({ convertedNote }: NotesMaterialProps) => {
  return (
    <div className="space-y-6">
      <Card className="p-8 bg-card border-border space-y-4">
        <h3 className="text-2xl font-bold">{convertedNote.title || "Untitled Notes"}</h3>
        
        {convertedNote.content && (
          <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: convertedNote.content }} />
        )}
        
        {convertedNote.tags && convertedNote.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border mt-4">
            {convertedNote.tags.map((tag, idx) => (
              <span key={idx} className="px-3 py-1 text-sm rounded-full bg-secondary/20 text-secondary-foreground border border-secondary/30">
                {tag}
              </span>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default NotesMaterial;

import { Card } from "@/components/ui/card";
import { MemoryPalace } from "@/types/memory-palace";

interface MemoryPalaceMaterialProps {
  memoryPalace: MemoryPalace;
}

const MemoryPalaceMaterial = ({ memoryPalace }: MemoryPalaceMaterialProps) => {
  return (
    <div className="space-y-6">
      <Card className="p-8 bg-card border-border space-y-4">
        <h3 className="text-2xl font-bold">{memoryPalace.title || "Untitled Memory Palace"}</h3>
        
        {memoryPalace.overview && (
          <div className="prose prose-invert max-w-none">
            <p className="mb-4 text-foreground/90 leading-relaxed">
              {memoryPalace.overview}
            </p>
          </div>
        )}

        {memoryPalace.rooms && memoryPalace.rooms.length > 0 && (
          <div className="space-y-6 pt-4">
            {memoryPalace.rooms.map((room, idx) => (
              <Card key={idx} className="p-6 bg-secondary/20 border-border space-y-3">
                <h4 className="font-semibold text-xl text-primary">{room.roomName}</h4>
                <p className="text-muted-foreground">{room.description}</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {room.items.map((item, itemIdx) => (
                    <li key={itemIdx}>
                      <span className="font-semibold">{item.concept}:</span> {item.visualization}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        )}

        {memoryPalace.tips && memoryPalace.tips.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border mt-4">
            <h4 className="font-semibold text-lg mb-2">Tips for Using This Palace</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              {memoryPalace.tips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
};

export default MemoryPalaceMaterial;

import { Card } from "@/components/ui/card";
import { Diagram } from "@/types/diagram";

interface DiagramMaterialProps {
  diagram: Diagram;
}

const DiagramMaterial = ({ diagram }: DiagramMaterialProps) => {
  return (
    <Card className="p-8 card-elegant border-border/50 animate-fade-in">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{diagram.title || "Diagram"}</h2>
        </div>

        {diagram.description && <p className="text-muted-foreground">{diagram.description}</p>}

        {diagram.elements && diagram.elements.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Elements</h3>
            <div className="grid gap-4">
              {diagram.elements.map((element, index) => (
                <Card key={index} className="p-4 bg-secondary/50">
                  <h4 className="font-semibold mb-2">{element.name || element.label}</h4>
                  <p className="text-sm text-muted-foreground">{element.description}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {diagram.connections && diagram.connections.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Connections</h3>
            <div className="space-y-2">
              {diagram.connections.map((conn, index) => (
                <div key={index} className="text-sm text-muted-foreground">
                  {conn.from} → {conn.to}: {conn.relationship || conn.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default DiagramMaterial;

import { Card } from "@/components/ui/card";
import { ComparisonTable } from "@/types/comparison";

interface ComparisonMaterialProps {
  comparisonTable: ComparisonTable;
}

const ComparisonMaterial = ({ comparisonTable }: ComparisonMaterialProps) => {
  return (
    <div className="space-y-6">
      {comparisonTable.items && comparisonTable.items.length > 0 && comparisonTable.criteria && comparisonTable.criteria.length > 0 ? (
        <Card className="p-8 bg-card border-border">
          <h3 className="text-2xl font-bold mb-4">{comparisonTable.title}</h3>
          {comparisonTable.description && <p className="text-muted-foreground mb-6">{comparisonTable.description}</p>}

          <div className="overflow-x-auto">
            <table className="w-full text-left table-auto">
              <thead>
                <tr className="bg-secondary/20">
                  <th className="p-3 font-semibold text-primary">Item</th>
                  {comparisonTable.criteria.map((criterion, idx) => (
                    <th key={idx} className="p-3 font-semibold text-primary">{criterion}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonTable.items.map((item, itemIdx) => (
                  <tr key={itemIdx} className="border-t border-border/50 hover:bg-secondary/10">
                    <td className="p-3 font-medium">{item.name}</td>
                    {comparisonTable.criteria.map((criterion, critIdx) => (
                      <td key={critIdx} className="p-3 text-muted-foreground">
                        {item[criterion.toLowerCase().replace(/\s/g, '')] || 'N/A'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-8 bg-card border-border">
          <p className="text-muted-foreground">No comparison data available.</p>
        </Card>
      )}
    </div>
  );
};

export default ComparisonMaterial;

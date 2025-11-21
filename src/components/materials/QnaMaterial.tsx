import { Card } from "@/components/ui/card";
import { QnAItem } from "@/types/qna";

interface QnaMaterialProps {
  qnaPairs: QnAItem[];
}

const QnaMaterial = ({ qnaPairs }: QnaMaterialProps) => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {qnaPairs.map((item, index) => (
          <Card key={index} className="p-6 bg-card border-border space-y-3">
            <h3 className="text-lg font-semibold text-primary">Q{index + 1}: {item.question}</h3>
            <p className="text-muted-foreground">A{index + 1}: {item.answer}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QnaMaterial;

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Trash2, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Material {
  id: string;
  type: string;
  title: string;
  created_at: string;
  metadata?: {
    topic?: string;
  };
}

const Materials = () => {
  const { toast } = useToast();
  const { data: materials = [], isLoading } = useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('generated_materials')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Material[];
    },
  });

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('generated_materials')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete material",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Deleted",
        description: "Material deleted successfully",
      });
    }
  };

  const getIcon = (type: string) => {
    const icons: Record<string, any> = {
      mcqs: "🎯",
      flashcards: "📚",
      summary: "📄",
      essay: "✍️",
    };
    return icons[type] || "📄";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return "1 day ago";
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">All Study Materials</h2>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-6 card-elegant animate-pulse">
              <div className="h-16 bg-muted/10 rounded" />
            </Card>
          ))}
        </div>
      ) : materials.length > 0 ? (
        <div className="grid gap-4">
          {materials.map((material) => (
            <Card key={material.id} className="p-6 card-elegant border-border/50 hover:border-primary/30 card-hover group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-2xl">{getIcon(material.type)}</div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{material.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                        {material.type.toUpperCase()}
                      </span>
                      {material.metadata?.topic && (
                        <span>{material.metadata.topic}</span>
                      )}
                      <span>•</span>
                      <span>{formatDate(material.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/materials/${material.id}`}>
                    <Button size="sm" variant="ghost" className="hover:bg-primary/10 hover:text-primary transition-all">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button size="sm" variant="ghost" className="hover:bg-destructive/10 hover:text-destructive transition-all" onClick={() => handleDelete(material.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 card-elegant text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary-glow/20 flex items-center justify-center">
            <BookOpen className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">No saved materials yet</h3>
            <p className="text-muted-foreground">
              Start generating study materials to see them here
            </p>
          </div>
          <Link to="/generate">
            <Button className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow-lg transition-all mt-4">
              Create Your First Material
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
};

export default Materials;

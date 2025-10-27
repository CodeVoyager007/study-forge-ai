import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Trash2, Eye, Target, Layers, FileText, Brain, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Material {
  id: string;
  type: string;
  title: string;
  created_at: string;
  metadata?: {
    topic?: string;
  };
}

const Dashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch materials with real-time updates
  const { data: materials = [], isLoading } = useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('generated_materials')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as Material[];
    },
  });

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('materials-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'generated_materials'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['materials'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Calculate real stats from data
  const stats = [
    { 
      label: "Total Generated", 
      value: materials.length.toString(), 
      icon: BookOpen,
      color: "from-purple-500 to-indigo-500"
    },
    { 
      label: "This Week", 
      value: materials.filter(m => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(m.created_at) > weekAgo;
      }).length.toString(), 
      icon: Target,
      color: "from-cyan-500 to-blue-500"
    },
    { 
      label: "Study Materials", 
      value: `${new Set(materials.map(m => m.type)).size} types`, 
      icon: Layers,
      color: "from-pink-500 to-rose-500"
    },
  ];

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
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    }
  };

  const getIcon = (type: string) => {
    const icons: Record<string, any> = {
      mcqs: Target,
      flashcards: Layers,
      summary: FileText,
      essay: Brain,
    };
    return icons[type] || FileText;
  };

  const getColor = (index: number) => {
    const colors = [
      "from-purple-500 to-indigo-500",
      "from-cyan-500 to-blue-500",
      "from-pink-500 to-rose-500",
      "from-orange-500 to-red-500",
      "from-green-500 to-emerald-500",
      "from-yellow-500 to-orange-500",
    ];
    return colors[index % colors.length];
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
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4 animate-fade-in-down">
            <h1 className="text-4xl md:text-5xl font-bold">
              Your <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Manage your study materials and track progress in real-time
            </p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <Card 
                key={index} 
                className="p-6 card-elegant border-border/50 card-hover animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className={`rounded-xl bg-gradient-to-br ${stat.color} w-14 h-14 flex items-center justify-center shadow-lg`}>
                    <stat.icon className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold gradient-text-secondary">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-4 animate-fade-in-up">
            <Link to="/generate" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow-lg transition-all duration-300 h-12 text-base group">
                <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                New Generation
              </Button>
            </Link>
            <Button variant="outline" className="flex-1 border-border/50 hover:border-primary/50 hover:bg-card-hover h-12 text-base">
              Continue Studying
            </Button>
          </div>

          {/* Saved Materials */}
          <div className="space-y-6">
            <div className="flex items-center justify-between animate-fade-in">
              <h2 className="text-2xl font-bold">Saved Materials</h2>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                View All
              </Button>
            </div>

            {isLoading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-6 card-elegant animate-pulse">
                    <div className="h-16 bg-muted/10 rounded" />
                  </Card>
                ))}
              </div>
            ) : materials.length > 0 ? (
              <div className="grid gap-4">
                {materials.map((material, index) => {
                  const Icon = getIcon(material.type);
                  return (
                    <Card 
                      key={material.id} 
                      className="p-6 card-elegant border-border/50 hover:border-primary/30 card-hover group animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`rounded-xl bg-gradient-to-br ${getColor(index)} w-14 h-14 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow`}>
                            <Icon className="h-7 w-7 text-white" />
                          </div>
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
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="hover:bg-primary/10 hover:text-primary transition-all"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="hover:bg-destructive/10 hover:text-destructive transition-all"
                            onClick={() => handleDelete(material.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-12 card-elegant text-center space-y-4 animate-bounce-in">
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
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create Your First Material
                  </Button>
                </Link>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

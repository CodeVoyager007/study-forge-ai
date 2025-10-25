import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Trash2, Eye, Target, Layers, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  // Mock saved materials
  const savedMaterials = [
    {
      id: 1,
      type: "mcqs",
      title: "Biology: Cell Structure",
      topic: "Cell Biology",
      createdAt: "2 hours ago",
      icon: Target,
      color: "from-purple-500 to-indigo-500"
    },
    {
      id: 2,
      type: "flashcards",
      title: "Spanish Vocabulary - Level 1",
      topic: "Spanish Language",
      createdAt: "1 day ago",
      icon: Layers,
      color: "from-cyan-500 to-blue-500"
    },
    {
      id: 3,
      type: "summary",
      title: "World War 2 Overview",
      topic: "History",
      createdAt: "3 days ago",
      icon: FileText,
      color: "from-pink-500 to-rose-500"
    },
  ];

  const stats = [
    { label: "Total Generated", value: "42", icon: BookOpen },
    { label: "This Week", value: "12", icon: Target },
    { label: "Study Streak", value: "7 days", icon: Layers },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              Your <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Manage your study materials and track progress
            </p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6 bg-card border-border">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-4">
            <Link to="/generate" className="flex-1">
              <Button className="w-full bg-primary hover:bg-primary-glow shadow-lg hover:shadow-primary/50 transition-all">
                New Generation
              </Button>
            </Link>
            <Button variant="outline" className="flex-1">
              Continue Studying
            </Button>
          </div>

          {/* Saved Materials */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Saved Materials</h2>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>

            {savedMaterials.length > 0 ? (
              <div className="grid gap-4">
                {savedMaterials.map((material) => (
                  <Card key={material.id} className="p-6 bg-card border-border hover:border-primary/50 card-hover">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`rounded-lg bg-gradient-to-br ${material.color} w-12 h-12 flex items-center justify-center flex-shrink-0`}>
                          <material.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <h3 className="text-lg font-semibold">{material.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                              {material.type.toUpperCase()}
                            </span>
                            <span>{material.topic}</span>
                            <span>•</span>
                            <span>{material.createdAt}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 bg-card border-border text-center space-y-4">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">No saved materials yet</h3>
                  <p className="text-muted-foreground">
                    Start generating study materials to see them here
                  </p>
                </div>
                <Link to="/generate">
                  <Button className="bg-primary hover:bg-primary-glow">
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

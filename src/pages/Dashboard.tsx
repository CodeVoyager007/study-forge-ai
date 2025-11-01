import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Trash2, Eye, Target, Layers, FileText, Brain, Sparkles, User, Settings, BarChart, Award, TrendingUp } from "lucide-react";
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

interface Profile {
  display_name: string | null;
  bio: string | null;
}

const Dashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");

  // Fetch materials with real-time updates
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

  // Fetch profile data
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data as Profile;
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

  // Get user email
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setEmail(user.email || "");
    });
  }, []);

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  // Calculate streak for profile stats
  const calculateStreak = () => {
    if (materials.length === 0) return 0;
    
    const dates = materials.map(m => new Date(m.created_at).toDateString());
    const uniqueDates = [...new Set(dates)].sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
    
    let streak = 0;
    const today = new Date().toDateString();
    
    if (uniqueDates[0] !== today) return 0;
    
    for (let i = 0; i < uniqueDates.length; i++) {
      const currentDate = new Date(uniqueDates[i]);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (currentDate.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Dashboard stats
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

  // Profile stats
  const profileStats = [
    { 
      label: "Total Generations", 
      value: materials.length.toString(),
      icon: Sparkles,
      color: "from-purple-500 to-indigo-500"
    },
    { 
      label: "Study Streak", 
      value: `${calculateStreak()} days`,
      icon: TrendingUp,
      color: "from-orange-500 to-red-500"
    },
    { 
      label: "Topics Explored", 
      value: new Set(materials.map(m => m.type)).size.toString(),
      icon: BarChart,
      color: "from-cyan-500 to-blue-500"
    },
    { 
      label: "This Week", 
      value: materials.filter(m => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(m.created_at) > weekAgo;
      }).length.toString(),
      icon: Award,
      color: "from-pink-500 to-rose-500"
    },
  ];

  const achievements = [
    { 
      title: "First Steps", 
      desc: "Generated your first material", 
      unlocked: materials.length >= 1 
    },
    { 
      title: "Study Streak", 
      desc: "7 days in a row", 
      unlocked: calculateStreak() >= 7 
    },
    { 
      title: "Power User", 
      desc: "50 materials generated", 
      unlocked: materials.length >= 50 
    },
    { 
      title: "Dedicated Learner", 
      desc: "100 materials generated", 
      unlocked: materials.length >= 100 
    },
    { 
      title: "Master Explorer", 
      desc: "Used all material types", 
      unlocked: new Set(materials.map(m => m.type)).size >= 5 
    },
    { 
      title: "Weekly Warrior", 
      desc: "25+ generations this week", 
      unlocked: materials.filter(m => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(m.created_at) > weekAgo;
      }).length >= 25
    },
  ];

  const handleSaveProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        bio: bio,
      })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  };

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
              Manage your study materials, track progress, and edit your profile
            </p>
          </div>

          {/* Tabbed Interface */}
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid w-full max-w-md grid-cols-3 mx-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="materials">Materials</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">

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

              {/* Recent Materials Preview */}
              <div className="space-y-6">
                <div className="flex items-center justify-between animate-fade-in">
                  <h2 className="text-2xl font-bold">Recent Materials</h2>
                </div>

                {isLoading ? (
                  <div className="grid gap-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="p-6 card-elegant animate-pulse">
                        <div className="h-16 bg-muted/10 rounded" />
                      </Card>
                    ))}
                  </div>
                ) : materials.slice(0, 5).length > 0 ? (
                  <div className="grid gap-4">
                    {materials.slice(0, 5).map((material, index) => {
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
            </TabsContent>

            {/* Materials Tab */}
            <TabsContent value="materials" className="space-y-6">
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
                  {materials.map((material, index) => {
                    const Icon = getIcon(material.type);
                    return (
                      <Card 
                        key={material.id} 
                        className="p-6 card-elegant border-border/50 hover:border-primary/30 card-hover group"
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
                      <Sparkles className="mr-2 h-4 w-4" />
                      Create Your First Material
                    </Button>
                  </Link>
                </Card>
              )}
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-8">
              {/* Profile Editor */}
              <Card className="p-8 card-elegant border-border/50">
                <div className="flex flex-col md:flex-row items-start gap-8">
                  <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground text-2xl">
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-6 w-full">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">Display Name</Label>
                        <Input
                          id="name"
                          placeholder="Your name"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="bg-background/50 border-border/50 focus:border-primary transition-all"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          className="bg-background/50 border-border/50"
                          disabled
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio" className="text-sm font-medium">Bio / Study Interests</Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us about your study goals..."
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="bg-background/50 border-border/50 focus:border-primary transition-all min-h-[100px]"
                        />
                      </div>
                    </div>

                    <Button 
                      onClick={handleSaveProfile}
                      className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow-lg transition-all"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Statistics */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-bold">Your Statistics</h2>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {profileStats.map((stat, index) => (
                    <Card 
                      key={index} 
                      className="p-6 card-elegant border-border/50 text-center card-hover group"
                    >
                      <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-3xl font-bold gradient-text-secondary mb-1">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <Card className="p-8 card-elegant border-border/50 space-y-6">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-bold">Achievements</h2>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  {achievements.map((achievement, index) => (
                    <Card 
                      key={index}
                      className={`p-5 text-center transition-all duration-300 card-hover ${
                        achievement.unlocked 
                          ? 'card-elegant border-primary/30 shadow-md hover:shadow-primary/20' 
                          : 'bg-card/30 border-border/30 opacity-60'
                      }`}
                    >
                      <div className={`w-14 h-14 mx-auto mb-3 rounded-xl flex items-center justify-center ${
                        achievement.unlocked 
                          ? 'bg-gradient-to-br from-primary to-primary-glow shadow-lg'
                          : 'bg-muted/20'
                      }`}>
                        <Award className={`h-7 w-7 ${
                          achievement.unlocked ? 'text-white' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <h3 className="font-semibold mb-1">{achievement.title}</h3>
                      <p className="text-xs text-muted-foreground">{achievement.desc}</p>
                      {achievement.unlocked && (
                        <div className="mt-2 inline-block px-2 py-1 rounded-full bg-success/10 text-success text-xs font-medium border border-success/20">
                          Unlocked
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

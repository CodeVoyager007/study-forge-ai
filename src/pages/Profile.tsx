import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, BarChart, Award, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Profile {
  display_name: string | null;
  bio: string | null;
}

const Profile = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");

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

  // Fetch materials for stats
  const { data: materials = [] } = useQuery({
    queryKey: ['user-materials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('generated_materials')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setEmail(user.email || "");
    });
  }, []);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  // Calculate real stats
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

  const stats = [
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

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4 animate-fade-in-down">
            <h1 className="text-4xl md:text-5xl font-bold">
              Your <span className="gradient-text">Profile</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Manage your account settings and view your progress
            </p>
          </div>

          {/* Profile Card */}
          <Card className="p-8 card-elegant border-border/50 animate-scale-in">
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
          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Your Statistics</h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <Card 
                  key={index} 
                  className="p-6 card-elegant border-border/50 text-center card-hover group animate-scale-in"
                  style={{ animationDelay: `${0.2 + index * 0.05}s` }}
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
          <Card className="p-8 card-elegant border-border/50 space-y-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
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
                  style={{ animationDelay: `${0.4 + index * 0.05}s` }}
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
        </div>
      </div>
    </div>
  );
};

export default Profile;

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, BarChart, Award, TrendingUp, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

const Profile = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
      return data;
    },
  });

  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-user-stats`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return await response.json();
    },
  });

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setEmail(user.email || "");
      }
    });
  }, []);

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

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Verify current password by trying to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (signInError) {
      toast({
        title: "Error",
        description: "Incorrect current password",
        variant: "destructive",
      });
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const achievements = [
    { 
      title: "First Steps", 
      desc: "Generated your first material", 
      unlocked: (userStats?.totalGenerated || 0) >= 1 
    },
    { 
      title: "Study Streak", 
      desc: "7 days in a row", 
      unlocked: (userStats?.streak || 0) >= 7 
    },
    { 
      title: "Power User", 
      desc: "50 materials generated", 
      unlocked: (userStats?.totalGenerated || 0) >= 50 
    },
    { 
      title: "Dedicated Learner", 
      desc: "100 materials generated", 
      unlocked: (userStats?.totalGenerated || 0) >= 100 
    },
    { 
      title: "Master Explorer", 
      desc: "Used all material types", 
      unlocked: (userStats?.materialTypes || 0) >= 5 
    },
    { 
      title: "Weekly Warrior", 
      desc: "25+ generations this week", 
      unlocked: (userStats?.thisWeek || 0) >= 25
    },
  ];

  return (
    <div className="space-y-8">
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
          <Card className="p-6 card-elegant border-border/50 text-center card-hover group">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <p className="text-3xl font-bold gradient-text-secondary mb-1">{userStats?.totalGenerated || 0}</p>
            <p className="text-sm text-muted-foreground">Total Generations</p>
          </Card>
          <Card className="p-6 card-elegant border-border/50 text-center card-hover group">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <p className="text-3xl font-bold gradient-text-secondary mb-1">{userStats?.streak || 0} days</p>
            <p className="text-sm text-muted-foreground">Study Streak</p>
          </Card>
          <Card className="p-6 card-elegant border-border/50 text-center card-hover group">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <BarChart className="h-6 w-6 text-white" />
            </div>
            <p className="text-3xl font-bold gradient-text-secondary mb-1">{userStats?.materialTypes || 0}</p>
            <p className="text-sm text-muted-foreground">Topics Explored</p>
          </Card>
          <Card className="p-6 card-elegant border-border/50 text-center card-hover group">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <Award className="h-6 w-6 text-white" />
            </div>
            <p className="text-3xl font-bold gradient-text-secondary mb-1">{userStats?.thisWeek || 0}</p>
            <p className="text-sm text-muted-foreground">This Week</p>
          </Card>
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

      {/* Change Password */}
      <Card className="p-8 card-elegant border-border/50">
        <h2 className="text-2xl font-bold mb-4">Change Password</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="bg-background/50 border-border/50 focus:border-primary transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-background/50 border-border/50 focus:border-primary transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-background/50 border-border/50 focus:border-primary transition-all"
            />
          </div>
          <Button
            onClick={handleChangePassword}
            className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow-lg transition-all"
          >
            Change Password
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Profile;

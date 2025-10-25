import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Settings, BarChart, Award } from "lucide-react";

const Profile = () => {
  const stats = [
    { label: "Total Generations", value: "42" },
    { label: "Study Streak", value: "7 days" },
    { label: "Topics Mastered", value: "12" },
    { label: "Hours Studied", value: "18.5" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              Your <span className="gradient-text">Profile</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Manage your account settings and view your progress
            </p>
          </div>

          {/* Profile Card */}
          <Card className="p-8 bg-card border-border">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <Avatar className="h-24 w-24">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-6 w-full">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      defaultValue="Student User"
                      className="bg-background"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      defaultValue="student@example.com"
                      className="bg-background"
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio / Study Interests</Label>
                    <Input
                      id="bio"
                      placeholder="Tell us about your study goals..."
                      className="bg-background"
                    />
                  </div>
                </div>

                <Button className="bg-primary hover:bg-primary-glow">
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
              {stats.map((stat, index) => (
                <Card key={index} className="p-6 bg-card border-border text-center">
                  <p className="text-3xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <Card className="p-8 bg-card border-border space-y-6">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Preferences</h2>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Default Difficulty Level</Label>
                <select className="w-full px-3 py-2 rounded-lg bg-background border border-input">
                  <option>Easy</option>
                  <option selected>Medium</option>
                  <option>Hard</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Preferred Study Format</Label>
                <select className="w-full px-3 py-2 rounded-lg bg-background border border-input">
                  <option>MCQs</option>
                  <option selected>Flashcards</option>
                  <option>Summaries</option>
                  <option>All Formats</option>
                </select>
              </div>
            </div>

            <Button className="bg-primary hover:bg-primary-glow">
              Save Preferences
            </Button>
          </Card>

          {/* Achievements */}
          <Card className="p-8 bg-card border-border space-y-6">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Achievements</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { title: "First Steps", desc: "Generated your first material", unlocked: true },
                { title: "Study Streak", desc: "7 days in a row", unlocked: true },
                { title: "Power User", desc: "50 materials generated", unlocked: false },
              ].map((achievement, index) => (
                <Card 
                  key={index}
                  className={`p-4 text-center ${
                    achievement.unlocked 
                      ? 'bg-primary/10 border-primary/30' 
                      : 'bg-secondary/50 border-border opacity-50'
                  }`}
                >
                  <Award className={`h-8 w-8 mx-auto mb-2 ${
                    achievement.unlocked ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <h3 className="font-semibold">{achievement.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{achievement.desc}</p>
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

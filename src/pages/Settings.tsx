import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, Bell, Palette, Lock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/components/ThemeProvider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const SettingsPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");  const { theme, setTheme } = useTheme();
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

  const handleChangeEmail = async () => {
    if (!newEmail) {
      toast({
        title: "Error",
        description: "New email cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.auth.updateUser({ email: newEmail });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update email",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "A confirmation link has been sent to your new email address.",
      });
      setNewEmail("");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="gradient-text">Settings</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Manage your account and preferences
            </p>
          </div>

          <div className="space-y-12">
            {/* Profile Settings */}
            <Card className="p-8 card-elegant border-border/50">
              <div className="flex items-center gap-4 mb-6">
                <User className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Profile Settings</h2>
              </div>
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
                      <Label htmlFor="name">Display Name</Label>
                      <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} />
                    </div>
                  </div>
                  <Button onClick={handleSaveProfile}>Save Profile</Button>
                </div>
              </div>
            </Card>

            {/* Account Settings */}
            <Card className="p-8 card-elegant border-border/50">
              <div className="flex items-center gap-4 mb-6">
                <Settings className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Account Settings</h2>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={email} disabled />
                  <div className="flex gap-2 mt-2">
                    <Input type="email" placeholder="New email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                    <Button variant="outline" size="sm" onClick={handleChangeEmail}>Change Email</Button>
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <Label>Change Password</Label>
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>
                  <Button variant="outline" size="sm" onClick={handleChangePassword}>Change Password</Button>
                </div>
              </div>
            </Card>

            {/* Theme Settings */}
            <Card className="p-8 card-elegant border-border/50">
              <div className="flex items-center gap-4 mb-6">
                <Palette className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Theme</h2>
              </div>
              <RadioGroup value={theme} onValueChange={setTheme} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vintage" id="vintage" />
                  <Label htmlFor="vintage">Vintage</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="system" />
                  <Label htmlFor="system">System</Label>
                </div>
              </RadioGroup>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

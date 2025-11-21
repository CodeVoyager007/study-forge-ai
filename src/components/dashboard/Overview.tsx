import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, Target, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import RealTimeHistory from "@/components/RealTimeHistory";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Overview = () => {
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

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 card-elegant border-border/50 card-hover animate-scale-in">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 w-14 h-14 flex items-center justify-center shadow-lg">
              <BookOpen className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold gradient-text-secondary">{userStats?.totalGenerated || 0}</p>
              <p className="text-sm text-muted-foreground">Total Generated</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 card-elegant border-border/50 card-hover animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 w-14 h-14 flex items-center justify-center shadow-lg">
              <Target className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold gradient-text-secondary">{userStats?.thisWeek || 0}</p>
              <p className="text-sm text-muted-foreground">This Week</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 card-elegant border-border/50 card-hover animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 w-14 h-14 flex items-center justify-center shadow-lg">
              <Layers className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold gradient-text-secondary">{userStats?.materialTypes || 0} types</p>
              <p className="text-sm text-muted-foreground">Study Materials</p>
            </div>
          </div>
        </Card>
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

      {/* Real-time History */}
      <RealTimeHistory />
    </div>
  );
};

export default Overview;

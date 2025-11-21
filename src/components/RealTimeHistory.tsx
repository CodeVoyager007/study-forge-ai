import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";

interface GenerationRecord {
  id: string;
  created_at: string;
  type: string;
  title: string;
  difficulty: string;
}

const RealTimeHistory = () => {
  const [history, setHistory] = useState<GenerationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("generated_materials")
          .select("id, created_at, type, title, difficulty")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching history:", error);
        } else {
          setHistory(data as GenerationRecord[]);
        }
      }
      setLoading(false);
    };

    fetchHistory();

    const channel = supabase
      .channel("realtime-history")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "generated_materials",
        },
        (payload) => {
          setHistory((prev) => [payload.new as GenerationRecord, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "generated_materials",
        },
        (payload) => {
          setHistory((prev) =>
            prev.map((item) =>
              item.id === payload.new.id ? (payload.new as GenerationRecord) : item
            )
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "generated_materials",
        },
        (payload) => {
          setHistory((prev) =>
            prev.filter((item) => item.id !== (payload.old as any).id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Generation History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-muted rounded-md animate-pulse" />
                  <div className="h-3 w-24 bg-muted rounded-md animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Real-time Generation History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <AnimatePresence>
            {history.length > 0 ? (
              history.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <div className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-sm">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{item.type}</Badge>
                        <Badge variant="secondary" className="text-xs capitalize">{item.difficulty}</Badge>
                      </div>
                    </div>
                  </div>
                  {index < history.length - 1 && <Separator />}
                </motion.div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-12">
                No generation history yet.
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RealTimeHistory;

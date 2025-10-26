import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Brain, Zap, BookOpen, Target, Lightbulb, ArrowRight, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const Landing = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session) {
        navigate("/generate");
      }
    });
  }, [navigate]);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Generation",
      description: "Advanced AI creates personalized study materials tailored to your learning style",
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Generate comprehensive study materials in seconds, not hours",
    },
    {
      icon: BookOpen,
      title: "18+ Formats",
      description: "MCQs, flashcards, summaries, essays, diagrams, and more - all in one place",
    },
    {
      icon: Target,
      title: "Real-Time Tracking",
      description: "Monitor your progress with detailed analytics and study history",
    },
  ];

  const tools = [
    { name: "MCQ Generator", desc: "Practice with auto-generated questions" },
    { name: "Flashcards", desc: "Memorable cards with flip animations" },
    { name: "Essay Writer", desc: "AI-powered essay generation with citations" },
    { name: "Diagram Creator", desc: "Visual flowcharts and timelines" },
    { name: "Vocabulary Builder", desc: "Spaced repetition learning" },
    { name: "Formula Sheets", desc: "Subject-specific equations" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 mesh-bg opacity-30 blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary-glow">
              <Sparkles className="h-4 w-4" />
              <span>AI-Powered Learning Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Master Any Subject with
              <span className="gradient-text block mt-2">Smart Study Materials</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Generate personalized MCQs, flashcards, summaries, essays, and 14+ more study formats. 
              Transform any topic into comprehensive learning materials in seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link to="/auth">
                <Button size="lg" className="bg-primary hover:bg-primary-glow shadow-lg hover:shadow-primary/50 transition-all text-lg px-8 h-14 group">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Learning Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 h-14 border-border hover:border-primary/50 hover:bg-secondary"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Explore Tools
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>18+ AI Tools</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>Unlimited generations</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">
              <span className="gradient-text">Why StudyForge AI?</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of studying with AI-powered tools designed for success
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="p-6 bg-card border-border hover:border-primary/50 card-hover group"
              >
                <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-sm text-accent">
              <Lightbulb className="h-4 w-4" />
              <span>Powerful Study Tools</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold">Everything You Need to Excel</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {tools.map((tool, index) => (
              <Card 
                key={index}
                className="p-6 bg-secondary/50 border-border hover:border-primary/50 card-hover cursor-pointer"
              >
                <h3 className="text-lg font-semibold mb-2">{tool.name}</h3>
                <p className="text-sm text-muted-foreground">{tool.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">How It Works</h2>
            <p className="text-xl text-muted-foreground">Three simple steps to better studying</p>
          </div>
          
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create Account", desc: "Sign up with email verification for secure access" },
              { step: "02", title: "Choose & Generate", desc: "Select format and enter your topic to generate materials" },
              { step: "03", title: "Study & Track", desc: "Learn with AI materials and monitor your progress" },
            ].map((item, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="text-4xl font-bold text-primary-glow">{item.step}</div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <Card className="p-12 bg-gradient-to-br from-primary/10 to-primary-glow/10 border-primary/20 text-center space-y-6 relative overflow-hidden">
            <div className="absolute inset-0 mesh-bg opacity-20" />
            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold">Ready to Study Smarter?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of students using AI to ace their exams with personalized study materials
              </p>
              <Link to="/auth">
                <Button size="lg" className="bg-primary hover:bg-primary-glow shadow-lg hover:shadow-primary/50 transition-all text-lg px-8 h-14">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Landing;

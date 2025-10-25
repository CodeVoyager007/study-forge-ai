import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Brain, Zap, BookOpen, Target, Lightbulb, ArrowRight } from "lucide-react";

const Landing = () => {
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
      title: "Multiple Formats",
      description: "MCQs, flashcards, summaries, mind maps, and more - all in one place",
    },
    {
      icon: Target,
      title: "Adaptive Learning",
      description: "Smart recommendations based on your progress and study patterns",
    },
  ];

  const tools = [
    { name: "MCQ Generator", desc: "Practice with auto-generated questions" },
    { name: "Flashcards", desc: "Memorable cards with flip animations" },
    { name: "Summary Generator", desc: "Concise topic overviews" },
    { name: "Mind Maps", desc: "Visual concept connections" },
    { name: "Study Guides", desc: "Comprehensive learning resources" },
    { name: "Practice Tests", desc: "Timed assessments with scoring" },
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
              Transform Any Topic Into
              <span className="gradient-text block mt-2">Perfect Study Materials</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Generate personalized MCQs, flashcards, summaries, and more in seconds. 
              Let AI handle the prep work while you focus on learning.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link to="/generate">
                <Button size="lg" className="bg-primary hover:bg-primary-glow shadow-lg hover:shadow-primary/50 transition-all text-lg px-8 h-14">
                  Start Generating
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="text-lg px-8 h-14 border-border hover:border-primary/50 hover:bg-secondary">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">Why StudyForge AI?</h2>
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
              { step: "01", title: "Choose Format", desc: "Select from MCQs, flashcards, summaries, and more" },
              { step: "02", title: "Enter Topic", desc: "Input any subject or concept you want to learn" },
              { step: "03", title: "Start Learning", desc: "Get instant AI-generated study materials" },
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
                Join thousands of students using AI to ace their exams
              </p>
              <Link to="/generate">
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

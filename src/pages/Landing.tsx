import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Zap, TrendingUp, Shield, Brain, Target, BookOpen, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useParallax, useScrollAnimation } from "@/hooks/use-scroll-animation";

const Landing = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const scrollY = useParallax();
  const heroAnim = useScrollAnimation();
  const featuresAnim = useScrollAnimation();
  const toolsAnim = useScrollAnimation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/home");
    });
  }, [navigate]);

  const features = [
    { icon: Brain, title: "AI-Powered", description: "Advanced AI generates personalized study materials", gradient: "from-primary to-primary-glow" },
    { icon: Zap, title: "Instant Results", description: "Get comprehensive materials in seconds", gradient: "from-secondary to-accent" },
    { icon: TrendingUp, title: "Track Progress", description: "Monitor your learning journey with analytics", gradient: "from-accent to-primary" },
    { icon: Shield, title: "Reliable Quality", description: "High-quality, accurate educational content", gradient: "from-primary-glow to-secondary" },
  ];

  const tools = [
    { icon: Target, title: "MCQ Generator", description: "Multiple choice questions with auto-grading", color: "primary" },
    { icon: BookOpen, title: "Flashcards", description: "Interactive flip cards for memorization", color: "secondary" },
    { icon: Lightbulb, title: "Summaries", description: "AI-powered topic overviews", color: "accent" },
    { icon: Brain, title: "Essay Writer", description: "Full essay generation with citations", color: "primary" },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Mesh Background */}
      <div className="fixed inset-0 mesh-bg opacity-30" />
      <div className="fixed inset-0 bg-gradient-to-b from-background via-background/95 to-background" />

      {/* Floating Orbs */}
      <div className="fixed top-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div ref={heroAnim.ref} className={`text-center space-y-8 ${heroAnim.isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border-2 border-primary/30 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">AI-Powered Learning Platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Transform Your Learning <br />
              <span className="gradient-text text-6xl md:text-8xl">With AI Power</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Generate study materials, flashcards, quizzes, and essays in seconds. 
              <span className="text-primary font-semibold"> Powered by advanced AI</span> to accelerate your learning journey.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/auth">
                <Button size="lg" className="text-lg h-14 px-8 shadow-neon">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Creating Free
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="text-lg h-14 px-8">
                  View Demo
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-12 max-w-3xl mx-auto">
              <div className="space-y-2">
                <div className="text-4xl font-bold gradient-text">18+</div>
                <div className="text-sm text-muted-foreground">AI Tools</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold gradient-text">24/7</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold gradient-text">100%</div>
                <div className="text-sm text-muted-foreground">Free Access</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div ref={featuresAnim.ref} className={`space-y-12 ${featuresAnim.isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">
                Why Choose <span className="gradient-text">StudyForge AI</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to excel in your studies, powered by cutting-edge AI
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card 
                  key={index}
                  className={`p-6 bg-card/60 group hover:bg-card/80 hover:scale-105 transition-all duration-300 ${
                    featuresAnim.isVisible ? `scale-reveal stagger-${index + 1}` : 'opacity-0'
                  }`}
                >
                  <div className={`rounded-2xl bg-gradient-to-br ${feature.gradient} w-14 h-14 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-glow transition-all`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tools Preview */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div ref={toolsAnim.ref} className={`space-y-12 ${toolsAnim.isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">
                <span className="gradient-text">18+ AI Study Tools</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                From flashcards to essays, we've got every study format covered
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {tools.map((tool, index) => (
                <Card 
                  key={index}
                  className={`p-8 bg-gradient-to-br from-card/80 to-card/40 group hover:scale-105 transition-all duration-300 border-2 ${
                    toolsAnim.isVisible ? `scale-reveal stagger-${index + 1}` : 'opacity-0'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-gradient-to-br from-primary to-primary-glow p-3 group-hover:shadow-neon transition-all">
                      <tool.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center pt-8">
              <Link to="/auth">
                <Button size="lg" variant="secondary" className="text-lg h-14 px-8">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Explore All 18 Tools
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl md:text-5xl font-bold">
              Getting Started is <span className="gradient-text">Simple</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Sign Up Free", description: "Create your account in seconds" },
              { step: "02", title: "Choose Tool", description: "Select from 18+ AI-powered tools" },
              { step: "03", title: "Generate & Learn", description: "Get instant study materials" },
            ].map((item, index) => (
              <div key={index} className="text-center space-y-4 group">
                <div className="text-6xl font-bold gradient-text opacity-30 group-hover:opacity-100 transition-opacity">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-12 bg-gradient-to-br from-card/80 via-primary/5 to-card/80 border-2 border-primary/30 text-center space-y-8 hover:border-primary/50 transition-all">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to <span className="gradient-text">Transform</span> Your Learning?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of students already using AI to study smarter, not harder.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/auth">
                <Button size="lg" className="text-lg h-14 px-8 shadow-neon">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Free Now
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

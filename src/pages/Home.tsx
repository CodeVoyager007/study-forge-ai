import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Sparkles, Zap, BookOpen, TrendingUp, Target, Lightbulb, ArrowRight, Award, Clock, CheckCircle2 } from "lucide-react";
import { useScrollAnimation, useParallax } from "@/hooks/use-scroll-animation";
import heroBg from "@/assets/home-hero-bg.jpg";
import featuresBg from "@/assets/home-features-bg.jpg";
import toolsBg from "@/assets/home-tools-bg.jpg";

const Home = () => {
  const scrollY = useParallax();
  const statsAnim = useScrollAnimation();
  const featuresAnim = useScrollAnimation();
  const toolsAnim = useScrollAnimation();

  const stats = [
    { icon: BookOpen, value: "18+", label: "AI Tools" },
    { icon: Clock, value: "24/7", label: "Available" },
    { icon: Award, value: "100%", label: "Free Access" },
  ];

  const highlights = [
    {
      icon: Brain,
      title: "Smart Learning",
      description: "AI adapts to your learning pace and style for maximum retention",
      color: "primary",
    },
    {
      icon: Zap,
      title: "Instant Generation",
      description: "Create study materials in seconds with advanced AI models",
      color: "accent",
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Monitor your study history and improvement over time",
      color: "primary-glow",
    },
    {
      icon: Target,
      title: "Goal Focused",
      description: "Set targets and achieve them with personalized study plans",
      color: "accent",
    },
  ];

  return (
    <div className="min-h-screen">

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-24 perspective-container">
        {/* Floating Animated Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/30 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-primary-glow/25 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-accent/15 rounded-full blur-3xl animate-pulse" />
        </div>
        
        {/* Parallax Background */}
        <div 
          className="absolute inset-0 parallax-bg"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.4,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-background" />
        <div className="absolute inset-0 mesh-bg opacity-30 blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <Sparkles className="h-5 w-5 text-primary-glow" />
              <span className="text-lg font-medium gradient-text">Welcome to StudyForge AI</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold leading-tight">
              Your Personal
              <span className="gradient-text block mt-4">AI Learning Hub</span>
            </h1>
            
            <p className="text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Transform the way you study with AI-powered tools that adapt to your needs. 
              Generate, practice, and master any subject effortlessly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
              <Link to="/generate">
                <Button size="lg" className="bg-primary hover:bg-primary-glow shadow-lg hover:shadow-primary/50 transition-all text-xl px-10 h-16 group">
                  <Sparkles className="mr-3 h-6 w-6" />
                  Start Generating
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-xl px-10 h-16 border-border hover:border-primary/50 hover:bg-secondary backdrop-blur-sm"
                >
                  <TrendingUp className="mr-3 h-6 w-6" />
                  View Dashboard
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div ref={statsAnim.ref} className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <Card 
                  key={index}
                  className={`p-6 bg-card/60 backdrop-blur-sm border-border hover:border-primary/50 card-hover ${
                    statsAnim.isVisible ? `scale-reveal stagger-${index + 1}` : 'opacity-0'
                  }`}
                >
                  <stat.icon className="h-10 w-10 text-primary mx-auto mb-3" />
                  <div className="text-4xl font-bold gradient-text mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section className="py-24 relative overflow-hidden perspective-container">
        <div 
          className="absolute inset-0 parallax-bg opacity-20"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`,
            backgroundImage: `url(${featuresBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold">
              <span className="gradient-text">Powerful Features</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to succeed in your studies, all in one place
            </p>
          </div>
          
          <div ref={featuresAnim.ref} className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {highlights.map((feature, index) => (
              <Card 
                key={index}
                className={`p-8 bg-card/70 backdrop-blur-sm border-border hover:border-primary/50 card-hover group ${
                  featuresAnim.isVisible ? `scroll-reveal stagger-${index + 1}` : 'opacity-0'
                }`}
              >
                <div className="rounded-xl bg-primary/10 w-16 h-16 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors group-hover:scale-110 transition-transform">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access Tools */}
      <section className="py-24 relative overflow-hidden perspective-container">
        <div 
          className="absolute inset-0 parallax-bg opacity-25"
          style={{
            transform: `translateY(${scrollY * 0.25}px)`,
            backgroundImage: `url(${toolsBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 backdrop-blur-sm">
              <Lightbulb className="h-5 w-5 text-accent" />
              <span className="font-medium">Quick Access</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold">Ready to Start?</h2>
            <p className="text-xl text-muted-foreground">Choose your learning tool and begin your journey</p>
          </div>
          
          <div ref={toolsAnim.ref} className="max-w-4xl mx-auto">
            <Card 
              className={`p-12 bg-gradient-to-br from-primary/10 via-primary-glow/10 to-accent/10 backdrop-blur-xl border-primary/20 text-center space-y-8 relative overflow-hidden ${
                toolsAnim.isVisible ? 'scale-reveal' : 'opacity-0'
              }`}
            >
              <div className="absolute inset-0 mesh-bg opacity-20" />
              <div className="relative z-10 space-y-8">
                <div className="flex flex-wrap justify-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-background/50 rounded-full backdrop-blur-sm border border-border">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>MCQs</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-background/50 rounded-full backdrop-blur-sm border border-border">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Flashcards</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-background/50 rounded-full backdrop-blur-sm border border-border">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Essays</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-background/50 rounded-full backdrop-blur-sm border border-border">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Summaries</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-background/50 rounded-full backdrop-blur-sm border border-border">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>And 14+ More</span>
                  </div>
                </div>
                
                <h3 className="text-3xl md:text-4xl font-bold">Access All Tools Now</h3>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Start generating personalized study materials instantly with our AI-powered platform
                </p>
                
                <Link to="/generate">
                  <Button size="lg" className="bg-primary hover:bg-primary-glow shadow-lg hover:shadow-primary/50 transition-all text-xl px-10 h-16 group">
                    <Brain className="mr-3 h-6 w-6" />
                    Explore All Tools
                    <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, TrendingUp, Target, Zap, Brain, BookOpen, Lightbulb, FileText } from "lucide-react";
import { useParallax, useScrollAnimation } from "@/hooks/use-scroll-animation";
import homeHeroBg from "@/assets/home-hero-bg.jpg";
import homeFeaturesBg from "@/assets/home-features-bg.jpg";
import homeToolsBg from "@/assets/home-tools-bg.jpg";

const Home = () => {
  const scrollY = useParallax();
  const heroAnim = useScrollAnimation();
  const featuresAnim = useScrollAnimation();
  const toolsAnim = useScrollAnimation();

  const features = [
    { icon: Brain, title: "Smart Learning", description: "AI adapts to your learning style and pace", gradient: "from-primary via-primary-glow to-secondary" },
    { icon: Zap, title: "Instant Generation", description: "Create study materials in seconds", gradient: "from-secondary via-accent to-primary" },
    { icon: TrendingUp, title: "Track Progress", description: "Monitor your improvement over time", gradient: "from-accent via-primary to-primary-glow" },
    { icon: Target, title: "Goal Focused", description: "Stay on track with personalized goals", gradient: "from-primary-glow via-secondary to-accent" },
  ];

  const tools = [
    { icon: Target, title: "MCQs", gradient: "from-primary to-primary-glow" },
    { icon: BookOpen, title: "Flashcards", gradient: "from-secondary to-accent" },
    { icon: FileText, title: "Essays", gradient: "from-accent to-primary" },
    { icon: Lightbulb, title: "Summaries", gradient: "from-primary-glow to-secondary" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 mesh-bg opacity-30" />
        <div 
          className="absolute inset-0 opacity-20 parallax-bg"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`,
            backgroundImage: `url(${homeHeroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        {/* Floating Gradient Orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />

        <div className="container mx-auto px-4 relative z-10">
          <div ref={heroAnim.ref} className={`max-w-4xl mx-auto text-center space-y-8 ${heroAnim.isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 border-2 border-primary/30 backdrop-blur-md shadow-glow">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-semibold text-primary">Welcome Back</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Your AI-Powered
              <br />
              <span className="gradient-text text-6xl md:text-8xl">Study Companion</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Generate personalized study materials with advanced AI. 
              <span className="text-primary font-semibold"> Transform any topic</span> into comprehensive learning resources instantly.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/generate">
                <Button size="lg" className="text-lg h-14 px-8 shadow-neon">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Generating
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="text-lg h-14 px-8">
                  View Dashboard
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-12 max-w-2xl mx-auto">
              <div className="space-y-2 p-4 rounded-xl bg-card/40 backdrop-blur-md border border-primary/20">
                <div className="text-4xl font-bold gradient-text">18+</div>
                <div className="text-sm text-muted-foreground">AI Tools</div>
              </div>
              <div className="space-y-2 p-4 rounded-xl bg-card/40 backdrop-blur-md border border-secondary/20">
                <div className="text-4xl font-bold gradient-text">24/7</div>
                <div className="text-sm text-muted-foreground">Availability</div>
              </div>
              <div className="space-y-2 p-4 rounded-xl bg-card/40 backdrop-blur-md border border-accent/20">
                <div className="text-4xl font-bold gradient-text">100%</div>
                <div className="text-sm text-muted-foreground">Free Access</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10 parallax-bg"
          style={{
            transform: `translateY(${scrollY * 0.15}px)`,
            backgroundImage: `url(${homeFeaturesBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div ref={featuresAnim.ref} className={`max-w-6xl mx-auto space-y-16 ${featuresAnim.isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-6xl font-bold">
                Powerful <span className="gradient-text">Features</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to accelerate your learning journey
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card 
                  key={index}
                  className={`p-6 group hover:scale-105 transition-all duration-300 bg-card/60 hover:bg-card/80 ${
                    featuresAnim.isVisible ? `scale-reveal stagger-${index + 1}` : 'opacity-0'
                  }`}
                >
                  <div className={`rounded-2xl bg-gradient-to-br ${feature.gradient} w-14 h-14 flex items-center justify-center mb-4 group-hover:shadow-glow transition-all`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Tools Section */}
      <section className="relative py-24 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10 parallax-bg"
          style={{
            transform: `translateY(${scrollY * 0.2}px)`,
            backgroundImage: `url(${homeToolsBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div ref={toolsAnim.ref} className={`max-w-4xl mx-auto ${toolsAnim.isVisible ? 'scale-reveal' : 'opacity-0'}`}>
            <Card className="p-12 bg-gradient-to-br from-card/80 via-primary/5 to-card/80 border-2 border-primary/30 hover:border-primary/50 transition-all">
              <div className="text-center space-y-8">
                <h2 className="text-4xl md:text-5xl font-bold">
                  Start Creating <span className="gradient-text">Right Now</span>
                </h2>
                <p className="text-xl text-muted-foreground">
                  Choose from our most popular AI study tools
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                  {tools.map((tool, index) => (
                    <div 
                      key={index}
                      className="p-4 rounded-xl bg-card/60 border border-border/50 hover:border-primary/50 hover:scale-105 transition-all group cursor-pointer"
                    >
                      <div className={`rounded-xl bg-gradient-to-br ${tool.gradient} w-12 h-12 flex items-center justify-center mx-auto mb-3 group-hover:shadow-glow transition-all`}>
                        <tool.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-sm font-semibold group-hover:text-primary transition-colors">
                        {tool.title}
                      </div>
                    </div>
                  ))}
                </div>

                <Link to="/generate">
                  <Button size="lg" variant="secondary" className="text-lg h-14 px-8 mt-4">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Explore All Tools
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

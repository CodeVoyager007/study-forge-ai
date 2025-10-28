import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { BookOpen, Brain, FileText, Layers, Target, FileCheck, Lightbulb, Map } from "lucide-react";
import { useScrollAnimation, useParallax } from "@/hooks/use-scroll-animation";
import toolsBg from "@/assets/tools-bg.jpg";

const Generate = () => {
  const scrollY = useParallax();
  const gridAnim = useScrollAnimation();
  
  const tools = [
    {
      icon: Target,
      title: "MCQ Generator",
      description: "Create multiple choice questions with auto-grading",
      path: "/generate/mcqs",
      color: "from-purple-500 to-indigo-500",
    },
    {
      icon: Layers,
      title: "Flashcard Generator",
      description: "Interactive flashcards with flip animations",
      path: "/generate/flashcards",
      color: "from-cyan-500 to-blue-500",
    },
    {
      icon: FileText,
      title: "Summary Generator",
      description: "AI-powered topic summaries and overviews",
      path: "/generate/summary",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: Brain,
      title: "Q&A Generator",
      description: "Generate comprehensive question-answer pairs",
      path: "/generate/qna",
      color: "from-teal-500 to-cyan-500",
    },
    {
      icon: FileText,
      title: "Essay Writer",
      description: "Full essay generation with citations",
      path: "/generate/essay",
      color: "from-rose-500 to-pink-500",
    },
    {
      icon: Map,
      title: "Diagram Generator",
      description: "Flowcharts, timelines, Venn diagrams",
      path: "/generate/diagram",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: BookOpen,
      title: "Vocabulary Builder",
      description: "Word lists with spaced repetition",
      path: "/generate/vocabulary",
      color: "from-blue-500 to-indigo-500",
    },
    {
      icon: Target,
      title: "Formula Sheets",
      description: "Subject-specific equations and derivations",
      path: "/generate/formulas",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: Lightbulb,
      title: "Study Schedule",
      description: "Personalized study timeline planner",
      path: "/generate/schedule",
      color: "from-violet-500 to-purple-500",
    },
    {
      icon: FileCheck,
      title: "Notes Converter",
      description: "Organize messy lecture notes",
      path: "/generate/notes",
      color: "from-cyan-500 to-teal-500",
    },
    {
      icon: Brain,
      title: "Transcript Summarizer",
      description: "YouTube video summaries with timestamps",
      path: "/generate/transcript",
      color: "from-yellow-500 to-amber-500",
    },
    {
      icon: FileText,
      title: "Case Study Analyzer",
      description: "Business and medical case analysis",
      path: "/generate/case-study",
      color: "from-indigo-500 to-blue-500",
    },
    {
      icon: Brain,
      title: "Memory Palace",
      description: "Visual memorization techniques",
      path: "/generate/memory-palace",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: Target,
      title: "Debate Prep",
      description: "Arguments, rebuttals, and evidence",
      path: "/generate/debate",
      color: "from-purple-500 to-violet-500",
    },
    {
      icon: FileCheck,
      title: "Comparison Tables",
      description: "Side-by-side concept analysis",
      path: "/generate/comparison",
      color: "from-emerald-500 to-green-500",
    },
    {
      icon: Target,
      title: "True/False Quiz",
      description: "Quiz with explanations for each answer",
      path: "/generate/true-false",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: FileText,
      title: "Fill-in-the-Blank",
      description: "Cloze deletion exercises",
      path: "/generate/fill-blanks",
      color: "from-teal-500 to-cyan-500",
    },
    {
      icon: Lightbulb,
      title: "Mnemonic Generator",
      description: "Acronyms and memory tricks",
      path: "/generate/mnemonics",
      color: "from-red-500 to-pink-500",
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 relative overflow-hidden">
      {/* Parallax Background */}
      <div 
        className="absolute inset-0 parallax-bg opacity-10"
        style={{
          transform: `translateY(${scrollY * 0.3}px)`,
          backgroundImage: `url(${toolsBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold">
              Choose Your <span className="gradient-text">Study Tool</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Select a format and let AI generate perfect study materials in seconds
            </p>
          </div>

          {/* Tools Grid */}
          <div ref={gridAnim.ref} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
            {tools.map((tool, index) => (
              <Link key={index} to={tool.path}>
                <Card 
                  className={`p-6 bg-card/80 backdrop-blur-sm border-border hover:border-primary/50 card-hover group h-full ${
                    gridAnim.isVisible ? `scale-reveal stagger-${(index % 6) + 1}` : 'opacity-0'
                  }`}
                >
                  <div className={`rounded-lg bg-gradient-to-br ${tool.color} w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <tool.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generate;

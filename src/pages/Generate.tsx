import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { BookOpen, Brain, FileText, Layers, Target, FileCheck, Lightbulb, Map } from "lucide-react";

const Generate = () => {
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
      icon: Map,
      title: "Mind Map Generator",
      description: "Visual concept maps and connections",
      path: "/generate/mindmap",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: BookOpen,
      title: "Study Guide Generator",
      description: "Comprehensive structured study materials",
      path: "/generate/study-guide",
      color: "from-orange-500 to-amber-500",
    },
    {
      icon: FileCheck,
      title: "Practice Test Generator",
      description: "Timed tests with performance analytics",
      path: "/generate/practice-test",
      color: "from-violet-500 to-purple-500",
    },
    {
      icon: Lightbulb,
      title: "Key Concepts Extractor",
      description: "Extract and organize main ideas",
      path: "/generate/concepts",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: Brain,
      title: "Q&A Generator",
      description: "Generate comprehensive question-answer pairs",
      path: "/generate/qna",
      color: "from-teal-500 to-cyan-500",
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
            {tools.map((tool, index) => (
              <Link key={index} to={tool.path}>
                <Card className="p-6 bg-card border-border hover:border-primary/50 card-hover group h-full">
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

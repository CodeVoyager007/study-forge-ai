import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "What is StudyForge AI?",
      answer: "StudyForge AI is an AI-powered platform designed to help students generate personalized study materials such as MCQs, flashcards, summaries, essays, and more, in seconds.",
    },
    {
      question: "How does it work?",
      answer: "You provide a topic or source material, choose a tool (e.g., MCQ Generator, Essay Writer), and our AI generates the content based on your specifications. It uses advanced language models to create relevant and accurate study aids.",
    },
    {
      question: "Is StudyForge AI free to use?",
      answer: "Yes, StudyForge AI offers a free tier with access to most of its features. Certain advanced features or higher usage limits might be part of a premium plan in the future.",
    },
    {
      question: "What types of study materials can I generate?",
      answer: "We offer a wide range of tools including MCQ Generator, Flashcard Generator, Summary Generator, Essay Writer, Diagram Generator, Vocabulary Builder, Formula Sheets, Q&A Generator, Study Schedule, Notes Converter, Transcript Summarizer, Case Study Analyzer, Memory Palace, Debate Prep, Comparison Tables, True/False Quiz, Fill-in-the-Blank, and Mnemonic Generator.",
    },
    {
      question: "Can I save my generated materials?",
      answer: "Yes, all generated materials can be saved to your personal dashboard for easy access and review anytime.",
    },
    {
      question: "Is my data private and secure?",
      answer: "We prioritize user privacy and data security. All data is encrypted, and we adhere to strict privacy policies. Your personal information and generated content are kept confidential.",
    },
    {
      question: "What if I encounter an error or have a suggestion?",
      answer: "Please navigate to the 'Support' section (or contact us via email if a support page is not yet implemented) to report any issues or provide feedback. We are constantly working to improve the platform.",
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="gradient-text">Frequently Asked Questions</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Find answers to common questions about StudyForge AI
            </p>
          </div>

          <Card className="p-8 bg-card border-border">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="font-semibold text-lg hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
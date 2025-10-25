import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Generate from "./pages/Generate";
import GenerateMCQ from "./pages/GenerateMCQ";
import GenerateFlashcards from "./pages/GenerateFlashcards";
import GenerateSummary from "./pages/GenerateSummary";
import GenerateEssay from "./pages/GenerateEssay";
import GenerateDiagram from "./pages/GenerateDiagram";
import GenerateVocabulary from "./pages/GenerateVocabulary";
import GenerateFormulas from "./pages/GenerateFormulas";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/generate" element={<Generate />} />
          <Route path="/generate/mcqs" element={<GenerateMCQ />} />
          <Route path="/generate/flashcards" element={<GenerateFlashcards />} />
          <Route path="/generate/summary" element={<GenerateSummary />} />
          <Route path="/generate/essay" element={<GenerateEssay />} />
          <Route path="/generate/diagram" element={<GenerateDiagram />} />
          <Route path="/generate/vocabulary" element={<GenerateVocabulary />} />
          <Route path="/generate/formulas" element={<GenerateFormulas />} />
          {/* Placeholder routes for remaining generators */}
          <Route path="/generate/qna" element={<GenerateMCQ />} />
          <Route path="/generate/schedule" element={<GenerateMCQ />} />
          <Route path="/generate/notes" element={<GenerateMCQ />} />
          <Route path="/generate/transcript" element={<GenerateMCQ />} />
          <Route path="/generate/case-study" element={<GenerateMCQ />} />
          <Route path="/generate/memory-palace" element={<GenerateMCQ />} />
          <Route path="/generate/debate" element={<GenerateMCQ />} />
          <Route path="/generate/comparison" element={<GenerateMCQ />} />
          <Route path="/generate/true-false" element={<GenerateMCQ />} />
          <Route path="/generate/fill-blanks" element={<GenerateMCQ />} />
          <Route path="/generate/mnemonics" element={<GenerateMCQ />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

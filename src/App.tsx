import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
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
          <Route path="/auth" element={<Auth />} />
          <Route path="/generate" element={<ProtectedRoute><Generate /></ProtectedRoute>} />
          <Route path="/generate/mcqs" element={<ProtectedRoute><GenerateMCQ /></ProtectedRoute>} />
          <Route path="/generate/flashcards" element={<ProtectedRoute><GenerateFlashcards /></ProtectedRoute>} />
          <Route path="/generate/summary" element={<ProtectedRoute><GenerateSummary /></ProtectedRoute>} />
          <Route path="/generate/essay" element={<ProtectedRoute><GenerateEssay /></ProtectedRoute>} />
          <Route path="/generate/diagram" element={<ProtectedRoute><GenerateDiagram /></ProtectedRoute>} />
          <Route path="/generate/vocabulary" element={<ProtectedRoute><GenerateVocabulary /></ProtectedRoute>} />
          <Route path="/generate/formulas" element={<ProtectedRoute><GenerateFormulas /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

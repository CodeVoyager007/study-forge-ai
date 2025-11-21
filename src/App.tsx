import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Generate from "./pages/Generate";
import GenerateMCQ from "./pages/GenerateMCQ";
import GenerateFlashcards from "./pages/GenerateFlashcards";
import GenerateSummary from "./pages/GenerateSummary";
import GenerateEssay from "./pages/GenerateEssay";
import GenerateDiagram from "./pages/GenerateDiagram";
import GenerateVocabulary from "./pages/GenerateVocabulary";
import GenerateFormulas from "./pages/GenerateFormulas";
import GenerateQna from "./pages/GenerateQna";
import GenerateSchedule from "./pages/GenerateSchedule";
import GenerateNotes from "./pages/GenerateNotes";
import GenerateTranscript from "./pages/GenerateTranscript";
import GenerateCaseStudy from "./pages/GenerateCaseStudy";
import GenerateMemoryPalace from "./pages/GenerateMemoryPalace";
import GenerateDebate from "./pages/GenerateDebate";
import GenerateComparison from "./pages/GenerateComparison";
import GenerateTrueFalse from "./pages/GenerateTrueFalse";
import GenerateFillBlanks from "./pages/GenerateFillBlanks";
import GenerateMnemonics from "./pages/GenerateMnemonics";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import SettingsPage from "./pages/Settings";
import Overview from "./components/dashboard/Overview";
import Materials from "./components/dashboard/Materials";
import Profile from "./components/dashboard/Profile";
import { ThemeProvider } from "./components/ThemeProvider";
import ViewMaterial from "./pages/ViewMaterial";
import FAQ from "./pages/FAQ"; // Added import for FAQ

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/generate" element={<ProtectedRoute><Generate /></ProtectedRoute>} />
            <Route path="/generate/mcqs" element={<ProtectedRoute><GenerateMCQ /></ProtectedRoute>} />
            <Route path="/generate/flashcards" element={<ProtectedRoute><GenerateFlashcards /></ProtectedRoute>} />
            <Route path="/generate/summary" element={<ProtectedRoute><GenerateSummary /></ProtectedRoute>} />
            <Route path="/generate/essay" element={<ProtectedRoute><GenerateEssay /></ProtectedRoute>} />
            <Route path="/generate/diagram" element={<ProtectedRoute><GenerateDiagram /></ProtectedRoute>} />
            <Route path="/generate/vocabulary" element={<ProtectedRoute><GenerateVocabulary /></ProtectedRoute>} />
            <Route path="/generate/formulas" element={<ProtectedRoute><GenerateFormulas /></ProtectedRoute>} />
            <Route path="/generate/qna" element={<ProtectedRoute><GenerateQna /></ProtectedRoute>} />
            <Route path="/generate/schedule" element={<ProtectedRoute><GenerateSchedule /></ProtectedRoute>} />
            <Route path="/generate/notes" element={<ProtectedRoute><GenerateNotes /></ProtectedRoute>} />
            <Route path="/generate/transcript" element={<ProtectedRoute><GenerateTranscript /></ProtectedRoute>} />
            <Route path="/generate/case-study" element={<ProtectedRoute><GenerateCaseStudy /></ProtectedRoute>} />
            <Route path="/generate/memory-palace" element={<ProtectedRoute><GenerateMemoryPalace /></ProtectedRoute>} />
            <Route path="/generate/debate" element={<ProtectedRoute><GenerateDebate /></ProtectedRoute>} />
            <Route path="/generate/comparison" element={<ProtectedRoute><GenerateComparison /></ProtectedRoute>} />
            <Route path="/generate/true-false" element={<ProtectedRoute><GenerateTrueFalse /></ProtectedRoute>} />
            <Route path="/generate/fill-blanks" element={<ProtectedRoute><GenerateFillBlanks /></ProtectedRoute>} />
            <Route path="/generate/mnemonics" element={<ProtectedRoute><GenerateMnemonics /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
              <Route index element={<Overview />} />
              <Route path="overview" element={<Overview />} />
              <Route path="materials" element={<Materials />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/materials/:id" element={<ProtectedRoute><ViewMaterial /></ProtectedRoute>} />
            <Route path="/faq" element={<FAQ />} /> {/* Not Protected */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);
export default App;

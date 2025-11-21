import QnaMaterial from "@/components/materials/QnaMaterial";
import ScheduleMaterial from "@/components/materials/ScheduleMaterial";
import NotesMaterial from "@/components/materials/NotesMaterial";
import TranscriptMaterial from "@/components/materials/TranscriptMaterial";
import CaseStudyMaterial from "@/components/materials/CaseStudyMaterial";
import MemoryPalaceMaterial from "@/components/materials/MemoryPalaceMaterial";
import DebateMaterial from "@/components/materials/DebateMaterial";
import ComparisonMaterial from "@/components/materials/ComparisonMaterial";
import TrueFalseMaterial from "@/components/materials/TrueFalseMaterial";
import FillBlanksMaterial from "@/components/materials/FillBlanksMaterial";
import MnemonicMaterial from "@/components/materials/MnemonicMaterial";

import { QnAItem } from "@/types/qna";
import { StudySchedule } from "@/types/schedule";
import { ConvertedNote } from "@/types/notes";
import { TranscriptSummary } from "@/types/transcript";
import { CaseStudyAnalysis } from "@/types/case-study";
import { MemoryPalace } from "@/types/memory-palace";
import { DebatePrep } from "@/types/debate";
import { ComparisonTable } from "@/types/comparison";
import { TrueFalseQuestion } from "@/types/true-false";
import { FillInTheBlankItem } from "@/types/fill-blanks";
import { Mnemonic } from "@/types/mnemonic";


const ViewMaterial = () => {
  const { id } = useParams();
  const [material, setMaterial] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterial = async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("generated_materials")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching material:", error);
      } else {
        setMaterial(data);
      }
      setLoading(false);
    };

    fetchMaterial();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <p>Material not found.</p>
      </div>
    );
  }

  const renderMaterialContent = () => {
    switch (material.type) {
      case "mcqs": {
        const mcqContent = material.content as { mcqs: MCQ[], userAnswers?: { [key: number]: number }, score?: number };
        return <McqMaterial mcqs={mcqContent.mcqs} userAnswers={mcqContent.userAnswers} score={mcqContent.score} />;
      }
      case "flashcards": {
        const flashcardContent = material.content as { flashcards: Flashcard[] };
        return <FlashcardMaterial flashcards={flashcardContent.flashcards} />;
      }
      case "summary": {
        const summaryContent = material.content as { summary: Summary };
        return <SummaryMaterial summary={summaryContent.summary} />;
      }
      case "essay": {
        const essayContent = material.content as { essay: Essay };
        return <EssayMaterial essay={essayContent.essay} />;
      }
      case "diagram": {
        const diagramContent = material.content as Diagram; // Diagram content is directly the Diagram object
        return <DiagramMaterial diagram={diagramContent} />;
      }
      case "vocabulary": {
        const vocabularyContent = material.content as { words: VocabularyWord[] };
        return <VocabularyMaterial words={vocabularyContent.words} />;
      }
      case "formulas": {
        const formulasContent = material.content as FormulasMaterialType; // Formulas content is directly the FormulasMaterialType object
        return <FormulasMaterial formulas={formulasContent} />;
      }
      case "qna": {
        const qnaContent = material.content as { qnaPairs: QnAItem[] };
        return <QnaMaterial qnaPairs={qnaContent.qnaPairs} />;
      }
      case "study-schedule": {
        const scheduleContent = material.content as { studySchedule: StudySchedule };
        return <ScheduleMaterial studySchedule={scheduleContent.studySchedule} />;
      }
      case "notes": {
        const notesContent = material.content as { convertedNote: ConvertedNote };
        return <NotesMaterial convertedNote={notesContent.convertedNote} />;
      }
      case "transcript-summary": {
        const transcriptSummaryContent = material.content as { transcriptSummary: TranscriptSummary };
        return <TranscriptMaterial transcriptSummary={transcriptSummaryContent.transcriptSummary} />;
      }
      case "case-study-analysis": {
        const caseStudyAnalysisContent = material.content as { caseStudyAnalysis: CaseStudyAnalysis };
        return <CaseStudyMaterial caseStudyAnalysis={caseStudyAnalysisContent.caseStudyAnalysis} />;
      }
      case "memory-palace": {
        const memoryPalaceContent = material.content as { memoryPalace: MemoryPalace };
        return <MemoryPalaceMaterial memoryPalace={memoryPalaceContent.memoryPalace} />;
      }
      case "debate-prep": {
        const debatePrepContent = material.content as { debatePrep: DebatePrep };
        return <DebateMaterial debatePrep={debatePrepContent.debatePrep} />;
      }
      case "comparison-table": {
        const comparisonTableContent = material.content as { comparisonTable: ComparisonTable };
        return <ComparisonMaterial comparisonTable={comparisonTableContent.comparisonTable} />;
      }
      case "true-false-quiz": {
        const trueFalseContent = material.content as { questions: TrueFalseQuestion[], userAnswers?: { [key: number]: boolean | null }, score?: number };
        return <TrueFalseMaterial questions={trueFalseContent.questions} userAnswers={trueFalseContent.userAnswers} score={trueFalseContent.score} />;
      }
      case "fill-blanks": {
        const fillBlanksContent = material.content as { fillBlanksExercise: FillInTheBlankItem[], userAnswers?: { [sentenceIndex: number]: { [blankIndex: number]: string } }, score?: number };
        return <FillBlanksMaterial fillBlanksExercise={fillBlanksContent.fillBlanksExercise} userAnswers={fillBlanksContent.userAnswers} score={fillBlanksContent.score} />;
      }
      case "mnemonic": {
        const mnemonicContent = material.content as { mnemonic: Mnemonic };
        return <MnemonicMaterial mnemonic={mnemonicContent.mnemonic} />;
      }
      default: {
        return (
          <Card className="p-8">
            <h1 className="text-3xl font-bold mb-4">{material.title}</h1>
            <div className="prose prose-invert max-w-none">
              <pre>{JSON.stringify(material.content, null, 2)}</pre>
            </div>
          </Card>
        );
      }
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <Link to="/dashboard/materials">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Materials
            </Button>
          </Link>
          {renderMaterialContent()}
        </div>
      </div>
    </div>
  );
};

export default ViewMaterial;


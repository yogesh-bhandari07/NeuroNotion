import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  BrainCircuit, 
  CheckSquare, 
  Sparkles, 
  Loader2, 
  FileText,
  AlertCircle,
  Image as ImageIcon,
  LayoutDashboard,
  Key,
  Briefcase
} from 'lucide-react';
import { AppState, StudyMaterial, TabView } from './types';
import { processTranscript } from './services/geminiService';
import SummaryView from './components/SummaryView';
import MindMapView from './components/MindMapView';
import QuizView from './components/QuizView';
import InfographicView from './components/InfographicView';
import OverviewView from './components/OverviewView';
import CaseStudyView from './components/CaseStudyView';

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [checkingKey, setCheckingKey] = useState<boolean>(true);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [transcript, setTranscript] = useState('');
  const [studyMaterial, setStudyMaterial] = useState<StudyMaterial | null>(null);
  const [activeTab, setActiveTab] = useState<TabView>('overview');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      try {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } catch (e) {
        console.error("Error checking API key:", e);
      } finally {
        setCheckingKey(false);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    await window.aistudio.openSelectKey();
    // Assume success to mitigate race condition
    setHasApiKey(true);
  };

  const handleGenerate = async () => {
    if (!transcript.trim()) return;

    setAppState(AppState.LOADING);
    setErrorMsg(null);

    try {
      const data = await processTranscript(transcript);
      setStudyMaterial(data);
      setAppState(AppState.SUCCESS);
      setActiveTab('overview'); // Switch to overview on success
    } catch (error) {
      console.error(error);
      setAppState(AppState.ERROR);
      setErrorMsg("Failed to process the transcript. Please try again or check your API key.");
    }
  };

  const handleInfographicGenerated = (url: string) => {
    setStudyMaterial(prev => {
      if (!prev) return null;
      return {
        ...prev,
        infographic_image_url: url
      };
    });
  };

  const handleVideoGenerated = (url: string) => {
    setStudyMaterial(prev => {
      if (!prev) return null;
      return {
        ...prev,
        generated_video_url: url
      };
    });
  };

  if (checkingKey) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  // Initial gate for API key selection (commented out as per previous context or if handled by wrapper)
  // For safety in this demo, I will leave the button in the header but rely on the effect to check.
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              NeuroNotion
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleSelectKey}
              className="text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors"
            >
              Switch API Key
            </button>
            <div className="text-sm font-medium text-slate-500 hidden sm:block">
              AI Study Assistant
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Input Section - Only show if no data yet */}
        {appState === AppState.IDLE && (
          <div className="max-w-2xl mx-auto mt-12 text-center animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Turn any transcript into a <br/>
              <span className="text-indigo-600">Master Study Guide</span>
            </h2>
            <p className="text-slate-600 mb-8 text-lg">
              Paste your video transcript below to get an instant Summary, Mind Map, Quiz, and Infographic.
            </p>
            
            <div className="bg-white p-2 rounded-2xl shadow-lg border border-slate-200 mb-6">
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste your transcript here..."
                className="w-full h-48 p-4 bg-slate-50 rounded-xl border-none resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-700 placeholder:text-slate-400"
              />
              <div className="flex justify-end p-2">
                <button
                  onClick={handleGenerate}
                  disabled={!transcript.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Study Material
                </button>
              </div>
            </div>
            
            <div className="flex justify-center gap-8 text-sm text-slate-400 flex-wrap">
              <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> Smart Summaries</span>
              <span className="flex items-center gap-1"><BrainCircuit className="w-4 h-4" /> Visual Mind Maps</span>
              <span className="flex items-center gap-1"><CheckSquare className="w-4 h-4" /> Self-Quizzes</span>
              <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> Case Studies</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {appState === AppState.LOADING && (
          <div className="flex flex-col items-center justify-center mt-24">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-6" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Analyzing Transcript...</h3>
            <p className="text-slate-500">Our AI is extracting key concepts and generating your study guide.</p>
          </div>
        )}

        {/* Error State */}
        {appState === AppState.ERROR && (
          <div className="flex flex-col items-center justify-center mt-24">
            <div className="bg-red-50 p-4 rounded-full mb-4">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Oops! Something went wrong.</h3>
            <p className="text-slate-600 mb-6">{errorMsg}</p>
            <button
              onClick={() => setAppState(AppState.IDLE)}
              className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results View */}
        {appState === AppState.SUCCESS && studyMaterial && (
          <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Your Study Material</h2>
                <button 
                  onClick={() => { setAppState(AppState.IDLE); setTranscript(''); setStudyMaterial(null); }}
                  className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  Start New Session
                </button>
             </div>

            {/* Tabs */}
            <div className="flex p-1 bg-slate-200 rounded-xl mb-8 w-fit overflow-x-auto max-w-full">
               <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'overview' 
                    ? 'bg-white text-indigo-700 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'summary' 
                    ? 'bg-white text-indigo-700 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/50'
                }`}
              >
                <FileText className="w-4 h-4" />
                Summary
              </button>
              <button
                onClick={() => setActiveTab('mindmap')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'mindmap' 
                    ? 'bg-white text-indigo-700 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/50'
                }`}
              >
                <BrainCircuit className="w-4 h-4" />
                Mind Map
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'quiz' 
                    ? 'bg-white text-indigo-700 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/50'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                Quiz
              </button>
               <button
                onClick={() => setActiveTab('casestudy')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'casestudy' 
                    ? 'bg-white text-indigo-700 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/50'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                Case Study
              </button>
              <button
                onClick={() => setActiveTab('infographic')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'infographic' 
                    ? 'bg-white text-indigo-700 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/50'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                Infographic
              </button>
            </div>

            {/* Content Area */}
            <div className="min-h-[500px]">
              {activeTab === 'overview' && (
                <OverviewView 
                  overviewText={studyMaterial.video_overview}
                  videoUrl={studyMaterial.generated_video_url}
                  onVideoGenerated={handleVideoGenerated}
                />
              )}
              {activeTab === 'summary' && (
                <SummaryView 
                  markdown={studyMaterial.summary_markdown} 
                />
              )}
              {activeTab === 'mindmap' && (
                <MindMapView 
                  nodesRaw={studyMaterial.mind_map.nodes} 
                  edgesRaw={studyMaterial.mind_map.edges} 
                />
              )}
              {activeTab === 'quiz' && (
                <QuizView questions={studyMaterial.quiz} />
              )}
              {activeTab === 'casestudy' && (
                <CaseStudyView data={studyMaterial.case_study} />
              )}
              {activeTab === 'infographic' && (
                <InfographicView 
                  description={studyMaterial.infographic_description}
                  imageUrl={studyMaterial.infographic_image_url}
                  onImageGenerated={handleInfographicGenerated}
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

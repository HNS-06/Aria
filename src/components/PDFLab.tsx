import { useState, useRef, ChangeEvent, DragEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Upload, 
  Search, 
  Zap, 
  Cpu, 
  ShieldCheck, 
  ChevronRight,
  BrainCircuit,
  MessageSquareShare,
  Mic,
  Loader2,
  Sparkles,
  ListChecks,
  Target,
  X,
  Plus,
  Download,
  Play,
  RotateCcw,
  Trophy,
  Lock,
  Volume2
} from 'lucide-react';
import { generateFlashcards, summarizeIntel, askTacticalTutor, generateAudioBriefing, type IntelSummary, type Flashcard } from '../services/geminiService';
import * as pdfjs from 'pdfjs-dist';

// Configure pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PDFLab() {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [scanResult, setScanResult] = useState<null | any>(null);
  const [summary, setSummary] = useState<IntelSummary | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [savedDecks, setSavedDecks] = useState<{id: string, topic: string, cards: Flashcard[], date: string}[]>([]);
  const [tutorMessages, setTutorMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [tutorInput, setTutorInput] = useState('');
  const [isAskingTutor, setIsAskingTutor] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [reviewResults, setReviewResults] = useState<{mastered: number, needsReview: number}>({ mastered: 0, needsReview: 0 });
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (incomingFiles: FileList | File[]) => {
    const pdfs = Array.from(incomingFiles).filter(f => f.type === 'application/pdf');
    if (pdfs.length > 0) {
      setFiles(prev => [...prev, ...pdfs]);
      setScanResult(null);
      setSummary(null);
      setFlashcards([]);
      setError(null);
    }
  };

  const handleSaveDeck = () => {
    if (!scanResult || flashcards.length === 0) return;
    
    const newDeck = {
      id: crypto.randomUUID(),
      topic: scanResult.topic,
      cards: [...flashcards],
      date: new Date().toLocaleDateString()
    };
    
    setSavedDecks(prev => [newDeck, ...prev]);
    setShowFlashcards(false);
  };

  const startReviewSession = () => {
    setIsReviewMode(true);
    setCurrentCardIndex(0);
    setReviewResults({ mastered: 0, needsReview: 0 });
  };

  const handleMarkAs = (status: 'mastered' | 'review') => {
    setReviewResults(prev => ({
      mastered: status === 'mastered' ? prev.mastered + 1 : prev.mastered,
      needsReview: status === 'review' ? prev.needsReview + 1 : prev.needsReview
    }));
    setCurrentCardIndex(prev => prev + 1);
  };

  const exitReviewMode = () => {
    setIsReviewMode(false);
    setCurrentCardIndex(0);
  };

  const launchDeck = (deck: any) => {
    setFlashcards(deck.cards);
    setShowFlashcards(true);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (files.length <= 1) {
      setScanResult(null);
      setSummary(null);
      setFlashcards([]);
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  };

  const handleScan = async () => {
    if (files.length === 0) return;
    
    setIsScanning(true);
    setError(null);
    
    try {
      // Step 1: Real Structural Scan & Extraction
      const extractedTexts = await Promise.all(files.map(file => extractTextFromPDF(file)));
      const combinedContext = extractedTexts.join('\n\n--- NEXT DOCUMENT ---\n\n');
      
      const mockScan = {
        topic: files.length > 1 ? `${files.length} Intelligence Units Integrated` : files[0].name,
        difficulty: 'Heroic',
        keyConcepts: ['Direct Extraction Active', 'Contextual Analysis Synchronized', 'Neural Mapping Ready'],
        estimatedStudyTime: `${Math.ceil(combinedContext.length / 1000)} Hours`,
        confidenceScore: 98
      };
      setScanResult(mockScan);
      setIsScanning(false);

      // Step 2: Trigger the Real AI Summarization
      setIsSummarizing(true);
      const result = await summarizeIntel(combinedContext);
      setSummary(result);
    } catch (err) {
      console.error(err);
      setError("AI Transmutation Failed. Mainframe connection unstable or PDF corrupted.");
    } finally {
      setIsScanning(false);
      setIsSummarizing(false);
    }
  };

  const handleExport = () => {
    if (!summary || !scanResult) return;

    const content = `
ARIA TACTICAL BRIEFING
Topic: ${scanResult.topic}
Date: ${new Date().toLocaleDateString()}
------------------------------------------

EXECUTIVE SUMMARY
${summary.executiveSummary}

CRITICAL TAKEAWAYS
${summary.criticalTakeaways.map((t, i) => `${i + 1}. ${t}`).join('\n')}

IMMEDIATE ACTION ITEMS
${summary.actionItems.map((a, i) => `[ ] ${a}`).join('\n')}

- Generated by ARIA AI Tactical Analyst -
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ARIA_Intel_${scanResult.topic.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGenerateFlashcards = async () => {
    if (files.length === 0) return;
    setIsGeneratingFlashcards(true);
    setError(null);
    try {
      const extractedTexts = await Promise.all(files.map(file => extractTextFromPDF(file)));
      const combinedContext = extractedTexts.join('\n\n');
      
      const result = await generateFlashcards(
        files.length > 1 ? "Combined Intelligence" : files[0].name, 
        combinedContext
      );
      setFlashcards(result);
      setShowFlashcards(true);
    } catch (err) {
      console.error(err);
      setError("Flashcard Synthesis Failed. Neural link broken or content too complex.");
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const handleAskTutor = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!tutorInput.trim() || !summary || isAskingTutor) return;

    const userMessage = tutorInput.trim();
    setTutorInput('');
    setTutorMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsAskingTutor(true);

    try {
      const context = `Executive Summary: ${summary.executiveSummary}. Takeaways: ${summary.criticalTakeaways.join(', ')}.`;
      const answer = await askTacticalTutor(userMessage, context);
      setTutorMessages(prev => [...prev, { role: 'assistant', content: answer }]);
    } catch (err) {
      console.error(err);
      setTutorMessages(prev => [...prev, { role: 'assistant', content: "Neural uplink interrupted. Please repeat the query." }]);
    } finally {
      setIsAskingTutor(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!summary || isGeneratingAudio) return;
    setIsGeneratingAudio(true);
    setError(null);
    try {
      const textToSpeak = `${summary.executiveSummary}. Here are the critical takeaways: ${summary.criticalTakeaways.join('. ')}`;
      await speakText(textToSpeak);
    } catch (err) {
      console.error(err);
      setError("Audio Synthesis Failed. Neural voice processors offline.");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const speakText = (text: string) => {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error("Neural voice processors not found in this browser."));
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Authoritative, slightly slower
      utterance.pitch = 0.8; // Deeper, commander voice
      
      // Try to find a good premium voice if available
      const voices = window.speechSynthesis.getVoices();
      const premiumVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Male'));
      if (premiumVoice) utterance.voice = premiumVoice;

      utterance.onend = () => resolve(true);
      utterance.onerror = (e) => reject(e);

      window.speechSynthesis.speak(utterance);
    });
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Study Mode Overlay */}
      <AnimatePresence>
        {isStudyMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex flex-col bg-slate-950 p-4 md:p-8 overflow-hidden"
          >
             <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-cyan-400 text-black rounded-lg shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                    <BrainCircuit size={24} />
                  </div>
                  <div>
                    <h2 className="font-lexend font-black text-2xl uppercase italic text-white tracking-widest">COGNITIVE SYNC: STUDY MODE</h2>
                    <p className="text-[10px] font-black uppercase text-cyan-400 tracking-[0.2em] animate-pulse">Dual-Link Active // Side-by-Side Synthesis</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsStudyMode(false)}
                  className="bg-red-500 text-black p-3 rounded-xl border-4 border-black font-lexend font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:bg-white transition-all flex items-center gap-2"
                >
                  <X size={20} />
                  Abort Mission
                </button>
             </div>

             <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-0">
                {/* Left Side: Summary Intel */}
                <div className="flex flex-col min-h-0 glass-panel bg-black/40 border-slate-800 p-6 overflow-hidden">
                   <div className="flex items-center gap-2 mb-6">
                      <Sparkles size={18} className="text-violet-400" />
                      <h3 className="font-lexend font-black uppercase text-sm tracking-widest">Master Intel Briefing</h3>
                   </div>
                   <div className="flex-1 overflow-y-auto pr-4 space-y-8 scrollbar-hide">
                      <div className="space-y-4">
                         <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Executive Summary</p>
                         <p className="text-lg font-medium text-slate-200 leading-relaxed italic border-l-4 border-violet-500 pl-6 py-2">
                           "{summary?.executiveSummary}"
                         </p>
                      </div>

                      <div className="space-y-4">
                         <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Critical Takeaways</p>
                         <div className="grid gap-3">
                            {summary?.criticalTakeaways.map((item, i) => (
                              <div key={i} className="p-4 bg-violet-600/5 border border-violet-500/20 rounded-xl flex gap-4">
                                <span className="font-lexend font-black text-violet-400">{i + 1}</span>
                                <p className="text-sm font-bold text-slate-300 leading-tight">{item}</p>
                              </div>
                            ))}
                         </div>
                      </div>

                      <div className="space-y-4 pb-8">
                         <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Actionable Intelligence</p>
                         <div className="space-y-2">
                            {summary?.actionItems.map((item, i) => (
                              <div key={i} className="flex items-center gap-3 p-3 bg-black/40 border border-black rounded-lg">
                                <Target size={14} className="text-cyan-400" />
                                <span className="text-xs font-bold text-slate-400">{item}</span>
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>

                {/* Middle: Flashcards */}
                <div className="flex flex-col min-h-0 glass-panel bg-black/40 border-slate-800 p-6 overflow-hidden">
                   <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Zap size={18} className="text-cyan-400" />
                        <h3 className="font-lexend font-black uppercase text-sm tracking-widest">Active Flashcards</h3>
                      </div>
                      <span className="text-[10px] font-black uppercase text-slate-500">{flashcards.length} Units Ready</span>
                   </div>
                   
                   <div className="flex-1 overflow-y-auto pr-4 space-y-4 scrollbar-hide">
                      {flashcards.map((card, i) => (
                        <div key={i} className="p-6 bg-slate-900 border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:border-cyan-400/50 transition-all group">
                           <div className="flex justify-between items-start mb-4">
                              <span className="text-[10px] font-black uppercase text-cyan-400">Unit {i+1}</span>
                              <div className="w-8 h-8 rounded bg-black/40 border border-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Search size={14} />
                              </div>
                           </div>
                           <div className="space-y-4">
                              <p className="font-lexend font-black text-lg leading-tight uppercase italic">{card.question}</p>
                              <div className="p-4 bg-black/60 rounded-xl border border-white/5">
                                <p className="text-xs font-bold text-violet-400 italic leading-relaxed">{card.answer}</p>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>

                   <button 
                    onClick={startReviewSession}
                    className="w-full mt-6 bg-cyan-400 text-black p-4 rounded-xl border-4 border-black font-lexend font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-white transition-all flex items-center justify-center gap-3 shrink-0"
                   >
                     <Play size={20} />
                     Run Drill Simulation
                   </button>
                </div>

                {/* Right Side: Tactical Tutor */}
                <div className="flex flex-col min-h-0 glass-panel bg-slate-900/50 border-slate-800 p-8 overflow-hidden lg:col-span-2">
                   <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                      <BrainCircuit size={20} className="text-cyan-400" />
                      <h3 className="font-lexend font-black uppercase text-lg tracking-widest text-white">Neural Link Tutor</h3>
                   </div>
                   
                   <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-hide">
                      {tutorMessages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center p-4 opacity-40 italic">
                           <p className="text-[10px] font-bold uppercase tracking-widest">Awaiting tactical query...</p>
                        </div>
                      )}
                      {tutorMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                           <div className={`p-4 rounded-2xl border-2 border-black text-sm leading-relaxed max-w-[85%] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] ${
                             msg.role === 'user' ? 'bg-cyan-400 text-black font-bold rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border-slate-700'
                           }`}>
                             {msg.content}
                           </div>
                        </div>
                      ))}
                      {isAskingTutor && (
                        <div className="flex justify-start">
                           <div className="animate-pulse flex items-center gap-2 text-[10px] text-cyan-400 font-black">
                              <Loader2 size={12} className="animate-spin" />
                              ANALYZING...
                           </div>
                        </div>
                      )}
                   </div>

                   <form onSubmit={handleAskTutor} className="flex gap-2">
                     <input 
                       value={tutorInput}
                       onChange={(e) => setTutorInput(e.target.value)}
                       placeholder="ASK TUTOR..."
                       className="flex-1 bg-black border-2 border-slate-800 rounded px-3 py-2 text-[10px] font-black uppercase text-white outline-none focus:border-cyan-400"
                     />
                     <button 
                       type="submit"
                       disabled={!tutorInput.trim() || isAskingTutor}
                       className="bg-cyan-400 text-black px-3 rounded font-black uppercase text-[10px] disabled:opacity-30"
                     >
                        Send
                     </button>
                   </form>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFlashcards && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setShowFlashcards(false)}
          >
             <motion.div 
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.9, y: 20 }}
               onClick={(e) => e.stopPropagation()}
               className="bg-slate-900 border-4 border-black w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-3xl shadow-[12px_12px_0px_0px_rgba(34,211,238,0.2)] p-8 relative"
             >
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="font-lexend font-black text-3xl uppercase tracking-tighter italic text-cyan-400">
                      {isReviewMode ? 'REVIEW SIMULATION' : 'Synthesized Flashcards'}
                    </h2>
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mt-1">
                      {isReviewMode ? `UNIT ${currentCardIndex + 1} / ${flashcards.length}` : 'Tactical Study Units Active'}
                    </p>
                  </div>
                  <button onClick={() => { setShowFlashcards(false); exitReviewMode(); }} className="bg-red-500 text-black p-2 rounded-lg border-2 border-black font-black hover:bg-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                {!isReviewMode ? (
                  <>
                    <div className="space-y-6">
                      {flashcards.map((card, i) => (
                        <div key={i} className="glass-panel p-6 bg-black/40 border border-white/5 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-3 opacity-10">
                            <span className="font-lexend font-black text-4xl">{i + 1}</span>
                          </div>
                          <div className="mb-4">
                            <p className="text-[10px] font-black uppercase text-cyan-400 mb-2">Question</p>
                            <p className="font-bold text-lg leading-tight text-white">{card.question}</p>
                          </div>
                          <div className="pt-4 border-t border-white/5">
                            <p className="text-[10px] font-black uppercase text-violet-400 mb-2">Answer</p>
                            <p className="text-slate-300 font-medium italic">{card.answer}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col gap-4 mt-8">
                      <button 
                        onClick={startReviewSession}
                        className="w-full bg-cyan-400 text-black p-4 rounded-xl border-4 border-black font-lexend font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-white transition-all flex items-center justify-center gap-3"
                      >
                        <Play size={20} />
                        Enter Review Mode
                      </button>
                      <div className="flex gap-4">
                        <button 
                          onClick={handleSaveDeck}
                          className="flex-1 bg-violet-600 text-white p-4 rounded-xl border-4 border-black font-lexend font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2"
                        >
                          <Plus size={20} />
                          Save Archive
                        </button>
                        <button 
                          onClick={() => setShowFlashcards(false)}
                          className="flex-1 bg-slate-800 text-slate-400 p-4 rounded-xl border-4 border-black font-lexend font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-8">
                    {currentCardIndex < flashcards.length ? (
                      <motion.div 
                        key={currentCardIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                      >
                         <div className="p-12 bg-black/60 border-4 border-black rounded-3xl text-center shadow-[8px_8px_0px_0px_rgba(34,211,238,0.1)]">
                            <p className="text-[10px] font-black uppercase text-cyan-400 tracking-[0.3em] mb-6">Cognitive Challenge</p>
                            <h3 className="font-lexend font-black text-2xl text-white mb-12 leading-tight">
                              {flashcards[currentCardIndex].question}
                            </h3>
                            
                            <div className="pt-8 border-t border-white/5">
                               <p className="text-[10px] font-black uppercase text-slate-500 mb-4">Neural Data Response</p>
                               <p className="text-xl font-bold text-violet-400 italic">
                                 {flashcards[currentCardIndex].answer}
                               </p>
                            </div>
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                            <button 
                              onClick={() => handleMarkAs('mastered')}
                              className="bg-green-500 text-black p-6 rounded-2xl border-4 border-black font-lexend font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex flex-col items-center gap-2"
                            >
                               <ShieldCheck size={28} />
                               Mastered
                            </button>
                            <button 
                              onClick={() => handleMarkAs('review')}
                              className="bg-red-500 text-black p-6 rounded-2xl border-4 border-black font-lexend font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex flex-col items-center gap-2"
                            >
                               <RotateCcw size={28} />
                               Needs Review
                            </button>
                         </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center p-12 glass-panel border-cyan-400"
                      >
                         <Trophy size={80} className="mx-auto text-cyan-400 mb-6 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]" />
                         <h3 className="font-lexend font-black text-4xl uppercase italic mb-2 text-white">DEBRIEFING COMPLETE</h3>
                         <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-8">Simulation Stats Synchronized</p>
                         
                         <div className="grid grid-cols-2 gap-8 mb-12">
                            <div className="p-6 bg-green-500/10 border-2 border-green-500/20 rounded-2xl">
                               <p className="text-4xl font-lexend font-black text-green-500">{reviewResults.mastered}</p>
                               <p className="text-[10px] font-black uppercase text-slate-500">Core Concepts Mastered</p>
                            </div>
                            <div className="p-6 bg-red-500/10 border-2 border-red-500/20 rounded-2xl">
                               <p className="text-4xl font-lexend font-black text-red-500">{reviewResults.needsReview}</p>
                               <p className="text-[10px] font-black uppercase text-slate-500">Units Requiring Recon</p>
                            </div>
                         </div>

                         <button 
                           onClick={exitReviewMode}
                           className="w-full bg-cyan-400 text-black p-4 rounded-xl border-4 border-black font-lexend font-black uppercase tracking-widest shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                         >
                           Return to Command
                         </button>
                      </motion.div>
                    )}
                  </div>
                )}
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header>
        <h2 className="font-lexend font-black text-4xl uppercase tracking-tighter italic text-white drop-shadow-[3px_3px_0px_rgba(123,92,240,1)]">PDF TRANSMUTATION LAB</h2>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">AI-Powered Extraction of Academic Essence</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <section className="space-y-6">
           <div 
             onClick={() => fileInputRef.current?.click()}
             onDragOver={handleDragOver}
             onDragLeave={handleDragLeave}
             onDrop={handleDrop}
             className={`glass-panel p-12 border-4 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center text-center group relative overflow-hidden ${
               isDragging ? 'border-cyan-400 bg-cyan-400/20 scale-[1.02]' : 
               files.length > 0 ? 'border-cyan-400 bg-cyan-400/5' : 'border-slate-800 hover:border-violet-500 hover:bg-violet-600/5'
             }`}
           >
             <input 
               type="file" 
               className="hidden" 
               ref={fileInputRef} 
               onChange={handleFileChange}
               accept="application/pdf"
               multiple
             />

             {/* Drag Overlay Effect */}
             <AnimatePresence>
               {isDragging && (
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="absolute inset-0 bg-cyan-400/10 flex items-center justify-center z-20 pointer-events-none"
                 >
                    <div className="p-8 border-2 border-cyan-400 rounded-full animate-bounce">
                      <Plus size={48} className="text-cyan-400" />
                    </div>
                 </motion.div>
               )}
             </AnimatePresence>

             <div className={`w-20 h-20 rounded-full border-2 border-black flex items-center justify-center mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform group-hover:scale-110 relative z-10 ${
               files.length > 0 ? 'bg-cyan-400 text-black' : 'bg-slate-900 group-hover:bg-violet-600'
             }`}>
               {files.length > 0 ? <ShieldCheck size={40} /> : <Upload size={40} />}
             </div>
             
             <h3 className="font-lexend font-black uppercase text-2xl tracking-tighter italic relative z-10">
               {files.length > 0 ? `${files.length} Core(s) Loaded` : 'Load Intel Core (PDF)'}
             </h3>
             <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2 max-w-xs relative z-10">
               Drag and drop your mission papers here or click to browse the mainframe
             </p>
           </div>

           {/* Queued Files List */}
           <AnimatePresence>
             {files.length > 0 && (
               <motion.div 
                 initial={{ opacity: 0, height: 0 }}
                 animate={{ opacity: 1, height: 'auto' }}
                 exit={{ opacity: 0, height: 0 }}
                 className="space-y-2 overflow-hidden"
               >
                 <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Active Intel Queue</p>
                 <div className="max-h-48 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                    {files.map((f, i) => (
                      <motion.div 
                        key={i}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-lg group"
                      >
                        <div className="flex items-center gap-3">
                          <FileText size={16} className="text-cyan-400" />
                          <span className="text-[11px] font-bold truncate max-w-[200px]">{f.name}</span>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                          className="p-1 hover:bg-red-500/20 text-slate-600 hover:text-red-500 rounded transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </motion.div>
                    ))}
                 </div>
               </motion.div>
             )}
           </AnimatePresence>

           <div className="grid grid-cols-2 gap-4">
              <button 
                disabled={files.length === 0 || isScanning || isSummarizing}
                onClick={handleScan}
                className="flex items-center justify-center gap-3 bg-violet-600 text-white p-6 rounded-xl border-4 border-black font-lexend font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-violet-500 hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isScanning || isSummarizing ? <Loader2 className="animate-spin" /> : <Search size={24} />}
                <span>{isSummarizing ? 'Transmuting...' : 'Scan for Intel'}</span>
              </button>
              <button 
                disabled={files.length === 0 || isScanning || isSummarizing || isGeneratingFlashcards}
                onClick={handleGenerateFlashcards}
                className="flex items-center justify-center gap-3 bg-slate-900 text-slate-400 p-6 rounded-xl border-2 border-black font-lexend font-black uppercase tracking-widest hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isGeneratingFlashcards ? <Loader2 className="animate-spin" /> : <Zap size={24} />}
                <span>{isGeneratingFlashcards ? 'Synthesizing...' : 'Quick Flashcards'}</span>
              </button>
           </div>

           {error && (
              <div className="p-4 bg-red-500/10 border-2 border-red-500/20 rounded text-red-500 text-xs font-bold italic">
                {error}
              </div>
           )}

           <div className="glass-panel p-6 bg-slate-950/40">
              <h4 className="font-lexend font-black uppercase text-sm mb-4 text-slate-500 italic">Advanced Protocols</h4>
              <div className="space-y-3">
                 {[
                   { icon: BrainCircuit, label: 'Full Conceptual Synthesis', xp: 500, action: () => {}, active: false },
                   { icon: MessageSquareShare, label: 'Tactical Tutor Interrogation', xp: 200, action: () => {
                      const chatEl = document.getElementById('tactical-chat');
                      chatEl?.scrollIntoView({ behavior: 'smooth' });
                   }, active: !!summary },
                   { icon: Mic, label: 'Audio Briefing Generation', xp: 1000, action: handleGenerateAudio, active: !!summary, loading: isGeneratingAudio },
                 ].map((proto, i) => (
                   <button 
                     key={i} 
                     disabled={!proto.active || proto.loading}
                     onClick={proto.action}
                     className={`w-full flex items-center justify-between p-3 bg-black/40 border rounded-lg group transition-colors ${
                       proto.active ? 'border-cyan-400/30 cursor-pointer hover:border-cyan-400 hover:bg-cyan-400/5' : 'border-white/5 opacity-50 cursor-not-allowed'
                     }`}
                   >
                      <div className="flex items-center gap-3">
                         {proto.loading ? <Loader2 size={18} className="text-cyan-400 animate-spin" /> : <proto.icon size={18} className="text-cyan-400" />}
                         <span className="font-bold text-xs uppercase tracking-tight">{proto.label}</span>
                      </div>
                      <div className="flex items-center gap-1">
                         <span className="text-[10px] font-black text-violet-400">+{proto.xp} XP</span>
                         {!proto.active ? <Lock size={12} className="text-slate-600" /> : <ChevronRight size={12} className="text-cyan-400" />}
                      </div>
                   </button>
                 ))}
              </div>
           </div>

           {/* Saved Decks Section */}
           <AnimatePresence>
             {savedDecks.length > 0 && (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="space-y-4"
               >
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-violet-500" />
                    <h4 className="font-lexend font-black uppercase text-sm tracking-widest">Tactical Deck Archives</h4>
                 </div>
                 <div className="grid grid-cols-1 gap-3">
                    {savedDecks.map((deck) => (
                      <button 
                        key={deck.id}
                        onClick={() => launchDeck(deck)}
                        className="flex items-center justify-between p-4 bg-violet-600/5 border-2 border-black rounded-xl hover:bg-violet-600/10 hover:border-violet-500 transition-all text-left shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
                      >
                        <div>
                          <p className="font-lexend font-black uppercase text-xs truncate max-w-[150px]">{deck.topic}</p>
                          <p className="text-[9px] font-bold text-slate-500">{deck.cards.length} Units • {deck.date}</p>
                        </div>
                        <BrainCircuit size={18} className="text-violet-400" />
                      </button>
                    ))}
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </section>

        <section className="space-y-8">
          <AnimatePresence mode="wait">
            {!scanResult && !isScanning && !isSummarizing && (
               <motion.div 
                 key="empty"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="min-h-[400px] flex flex-col items-center justify-center p-12 text-center opacity-20 filter grayscale glass-panel"
               >
                 <div className="relative mb-8">
                   <FileText size={160} className="text-slate-500" />
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-2 bg-red-500/50 rotate-45" />
                 </div>
                 <h3 className="font-lexend font-black text-3xl uppercase tracking-tighter">No Intel Processed</h3>
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Load and Scan a PDF to generate strategic insights</p>
               </motion.div>
            )}

            {(isScanning || isSummarizing) && (
               <motion.div 
                 key="scanning"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="min-h-[400px] flex flex-col items-center justify-center p-12 text-center glass-panel"
               >
                 <div className="relative mb-8">
                   {isSummarizing ? (
                     <BrainCircuit size={120} className="text-cyan-400 animate-pulse" />
                   ) : (
                     <Cpu size={120} className="text-violet-500 animate-pulse" />
                   )}
                   <div className="absolute inset-0 border-4 border-cyan-400 rounded-full animate-ping opacity-20" />
                 </div>
                 <h3 className="font-lexend font-black text-3xl uppercase tracking-tighter italic">
                   {isSummarizing ? 'Synthesizing Tactical Summary...' : 'Analyzing Mainframe...'}
                 </h3>
                 <div className="w-64 h-2 bg-black border border-white/10 rounded-full mt-4 overflow-hidden">
                    <motion.div 
                      key={isSummarizing ? 'sum' : 'scan'}
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2.5 }}
                      className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                    />
                 </div>
               </motion.div>
            )}

            {scanResult && !isScanning && !isSummarizing && (
               <motion.div 
                 key="result"
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="space-y-6"
               >
                 <div className="glass-panel p-8 border-t-8 border-t-cyan-400 bg-cyan-400/5">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                          <h3 className="font-lexend font-black text-2xl uppercase tracking-tighter italic">{scanResult.topic}</h3>
                          <p className="text-cyan-400 font-bold uppercase tracking-widest text-[10px]">Intel Extraction Successful</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded bg-red-600 text-white shadow-[2px_2px_0_rgba(0,0,0,1)]`}>
                            Difficulty: {scanResult.difficulty}
                          </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 bg-black/60 border-2 border-black rounded-xl">
                          <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Time Estimate</p>
                          <p className="font-lexend font-black text-xl italic">{scanResult.estimatedStudyTime}</p>
                        </div>
                        <div className="p-4 bg-black/60 border-2 border-black rounded-xl">
                          <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Confidence</p>
                          <p className="font-lexend font-black text-xl italic text-green-500">{scanResult.confidenceScore}%</p>
                        </div>
                    </div>

                    <section className="mb-8">
                        <h4 className="font-lexend font-black uppercase text-sm mb-4 flex items-center gap-2">
                          <span className="w-1.5 h-4 bg-cyan-400 inline-block" />
                          Key Intel Nodes
                        </h4>
                        <div className="space-y-2">
                          {scanResult.keyConcepts.map((concept: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-black group hover:border-white/20 transition-all">
                                <span className="font-bangers text-lg text-violet-500">{idx + 1}</span>
                                <span className="font-bold text-sm tracking-tight">{concept}</span>
                                <ChevronRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          ))}
                        </div>
                    </section>

                    <button 
                      onClick={() => setIsStudyMode(true)}
                      className="w-full bg-white text-black p-4 rounded-xl border-4 border-black font-lexend font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-cyan-400 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
                    >
                       Deploy Learning Path
                    </button>
                 </div>

                 {summary && (
                   <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="space-y-6"
                   >
                     <div className="glass-panel p-8 bg-violet-600/10 border-l-8 border-l-violet-500">
                        <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-violet-600/20 rounded border border-violet-500/30">
                              <Sparkles size={20} className="text-violet-400" />
                            </div>
                            <h3 className="font-lexend font-black uppercase text-xl italic">Tactical Briefing</h3>
                          </div>
                          <button 
                            onClick={handleExport}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-violet-400 p-2 bg-violet-400/5 border border-violet-400/20 rounded hover:bg-violet-400 hover:text-black transition-all"
                          >
                            <Download size={14} />
                            Export Intel
                          </button>
                          {flashcards.length > 0 && (
                            <button 
                              onClick={() => setIsStudyMode(true)}
                              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-400 p-2 bg-cyan-400/5 border border-cyan-400/20 rounded hover:bg-cyan-400 hover:text-black transition-all"
                            >
                              <BrainCircuit size={14} />
                              Study Mode
                            </button>
                          )}
                        </div>

                        <div className="space-y-6">
                          <p className="text-sm font-medium text-slate-300 leading-relaxed bg-black/40 p-4 rounded-lg border border-white/5 italic">
                            "{summary.executiveSummary}"
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-3">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-violet-400 flex items-center gap-2">
                                  <ListChecks size={14} />
                                  Takeaways
                                </h4>
                                <ul className="space-y-2">
                                  {summary.criticalTakeaways.map((item, i) => (
                                    <li key={i} className="text-[11px] font-bold text-slate-400 flex gap-2">
                                      <span className="text-violet-500">▶</span>
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                             </div>
                             <div className="space-y-3">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                                  <Target size={14} />
                                  Next Actions
                                </h4>
                                <ul className="space-y-2">
                                  {summary.actionItems.map((item, i) => (
                                    <li key={i} className="text-[11px] font-bold text-slate-400 flex gap-2">
                                      <span className="text-cyan-500">◈</span>
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                             </div>
                          </div>
                        </div>
                     </div>

                     {/* Tactical Tutor Chat */}
                     <div id="tactical-chat" className="glass-panel p-6 bg-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col h-[500px]">
                        <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-4">
                           <BrainCircuit size={20} className="text-cyan-400" />
                           <h3 className="font-lexend font-black uppercase text-sm tracking-widest">Neural Link Tutor</h3>
                           <div className="ml-auto flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                              <span className="text-[9px] font-black uppercase text-slate-500">Uplink Active</span>
                           </div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-hide">
                           {tutorMessages.length === 0 && (
                             <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40 italic">
                                <MessageSquareShare size={48} className="mb-4 text-slate-600" />
                                <p className="text-xs font-bold uppercase tracking-widest">Ask the Tactical Analyst about this intel...</p>
                             </div>
                           )}
                           {tutorMessages.map((msg, i) => (
                             <motion.div 
                               key={i}
                               initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                               animate={{ opacity: 1, x: 0 }}
                               className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                             >
                                <div className={`max-w-[85%] p-4 rounded-xl border-2 border-black font-medium text-xs leading-relaxed ${
                                  msg.role === 'user' 
                                    ? 'bg-cyan-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]' 
                                    : 'bg-black/60 text-slate-200 shadow-[-4px_4px_0px_0px_rgba(56,189,248,0.2)]'
                                }`}>
                                   {msg.content}
                                </div>
                             </motion.div>
                           ))}
                           {isAskingTutor && (
                              <div className="flex justify-start">
                                 <div className="bg-black/60 text-slate-200 p-4 rounded-xl border-2 border-black flex items-center gap-3">
                                    <Loader2 size={16} className="animate-spin text-cyan-400" />
                                    <span className="text-[9px] font-black uppercase tracking-widest animate-pulse">Consulting Mainframe...</span>
                                 </div>
                              </div>
                           )}
                        </div>

                        <form onSubmit={handleAskTutor} className="flex gap-2 relative">
                           <input 
                             value={tutorInput}
                             onChange={(e) => setTutorInput(e.target.value)}
                             placeholder="QUERY MISSION PARAMETERS..."
                             className="flex-1 bg-black border-2 border-black rounded-lg p-3 text-[11px] font-black uppercase tracking-widest focus:border-cyan-400 outline-none text-white placeholder-slate-700"
                           />
                           <button 
                             type="submit"
                             disabled={!tutorInput.trim() || isAskingTutor}
                             className="bg-cyan-400 text-black px-4 rounded-lg border-2 border-black font-black uppercase text-[10px] tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-30"
                           >
                              Send
                           </button>
                        </form>
                     </div>
                   </motion.div>
                 )}
               </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}

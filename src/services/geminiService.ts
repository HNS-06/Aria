import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { retry, MOCK_RESPONSES } from "./apiReliability";

let ai: GoogleGenerativeAI | null = null;
try {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '');
  if (apiKey) {
    ai = new GoogleGenerativeAI(apiKey);
  }
} catch (e) {
  console.warn("AI initialization failed", e);
}

let groq: Groq | null = null;
try {
  const groqApiKey = (import.meta as any).env?.VITE_GROQ_API_KEY || (typeof process !== 'undefined' ? process.env?.GROQ_API_KEY : '');
  if (groqApiKey) {
    groq = new Groq({ apiKey: groqApiKey, dangerouslyAllowBrowser: true });
  }
} catch (e) {
  console.warn("Groq initialization failed", e);
}

export interface Mission {
  id: number;
  title: string;
  progress: number;
  color: string;
}

export interface StudyPlan {
  prioritizedMissions: {
    missionId: number;
    reason: string;
    priority: 'High' | 'Medium' | 'Low';
    suggestedFocusMinutes: number;
  }[];
  strategicAdvice: string;
}

export interface IntelSummary {
  executiveSummary: string;
  criticalTakeaways: string[];
  actionItems: string[];
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface MissionAnalysis {
  bottlenecks: {
    missionId: number;
    issue: string;
    suggestion: string;
  }[];
  victories: {
    missionId: number;
    strength: string;
  }[];
  overallStatus: string;
}

export interface ModuleContent {
  notes: string;
  importantTopics: string[];
  definitions: { term: string; definition: string }[];
  equations: { formula: string; explanation: string }[];
  keyPoints: string[];
}

const validateResponse = <T>(data: any, fallback: T): T => {
  if (!data || typeof data !== 'object') return fallback;
  return { ...fallback, ...data };
};

export async function generateAudioBriefing(text: string): Promise<string> {
  if (!ai) return `Strategic Briefing: ${text}`;
  
  return retry(async () => {
    const prompt = `Say in an authoritative, futuristic commander voice: "Attention Hero Scholar. Here is your tactical briefing." Then read this summary: ${text}`;
    const model = ai!.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: "v1" });
    const response = await model.generateContent(prompt);
    const result = await response.response;
    return result.text() || `Briefing: ${text}`;
  });
}

export async function generateFlashcards(topic: string, content: string): Promise<Flashcard[]> {
  if (!ai) return [{ question: `Identify core concepts of ${topic}`, answer: "AI Uplink Restricted." }];

  try {
    return await retry(async () => {
      const prompt = `Generate 8 high-stakes study flashcards for a Hero Scholar from this intelligence:
      Topic: ${topic}
      Content: ${content.substring(0, 30000)} // Limiting to fit context
      
      For each card, provide a challenging question and a comprehensive answer that includes a clear explanation of the underlying concept.
      Return as JSON with a "flashcards" array of {question, answer}.`;

      const model = ai!.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      }, { apiVersion: "v1" });
      const response = await model.generateContent(prompt);
      const result = await response.response;
      const data = JSON.parse(result.text());
      return data.flashcards || [];
    });
  } catch (e) {
    console.error("Flashcard generation failed, using fallback", e);
    return [{ question: `Identify core concepts of ${topic}`, answer: "Neural synthesis interrupted." }];
  }
}

export async function askTacticalTutor(question: string, context: string): Promise<string> {
  if (!groq) return "AI Uplink restricted. Re-establish Groq connection.";

  return retry(async () => {
    const prompt = `Tactical Query: "${question}"\nContext: ${context}`;
    const chatCompletion = await groq!.chat.completions.create({
      messages: [
        { role: "system", content: "You are the ARIA Tactical Analyst. Provide precise guidance." },
        { role: "user", content: prompt }
      ],
      model: "llama-3.1-8b-instant",
    });
    return chatCompletion.choices[0]?.message?.content || "Signal interference detected.";
  });
}

export async function summarizeIntel(content: string): Promise<IntelSummary> {
  if (!ai) return MOCK_RESPONSES.INTEL_SUMMARY;

  try {
    return await retry(async () => {
      const prompt = `Perform a high-density academic synthesis of the following intelligence:
      ${content.substring(0, 40000)}
      
      Return as JSON with these keys:
      - executiveSummary: A powerful, authoritative summary of the core thesis.
      - criticalTakeaways: A string array of the 5 most vital concepts.
      - actionItems: A string array of specific study/review tasks based on the content.`;

      const model = ai!.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      }, { apiVersion: "v1" });
      const response = await model.generateContent(prompt);
      const result = await response.response;
      return validateResponse(JSON.parse(result.text()), MOCK_RESPONSES.INTEL_SUMMARY);
    });
  } catch (e) {
    return MOCK_RESPONSES.INTEL_SUMMARY;
  }
}

export async function analyzeMissionProgress(missions: Mission[]): Promise<MissionAnalysis> {
  if (!ai) return MOCK_RESPONSES.MISSION_ANALYSIS;

  try {
    return await retry(async () => {
      const prompt = `Diagnostic Scan: ${JSON.stringify(missions)}. Return JSON: { bottlenecks: [{ missionId, issue, suggestion }], victories: [{ missionId, strength }], overallStatus: string }`;
      const model = ai!.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      }, { apiVersion: "v1" });
      const response = await model.generateContent(prompt);
      const result = await response.response;
      return validateResponse(JSON.parse(result.text()), MOCK_RESPONSES.MISSION_ANALYSIS);
    });
  } catch (e) {
    return MOCK_RESPONSES.MISSION_ANALYSIS;
  }
}

export async function generateStudyPlan(missions: Mission[], overallXP: number, level: number, focusTime: number): Promise<StudyPlan> {
  if (!ai) return MOCK_RESPONSES.STUDY_PLAN;

  try {
    return await retry(async () => {
      const prompt = `Generate study plan: Level ${level}, XP ${overallXP}, Missions ${JSON.stringify(missions)}, Time ${focusTime}m. Return JSON: { prioritizedMissions: [{ missionId, reason, priority, suggestedFocusMinutes }], strategicAdvice: string }`;
      const model = ai!.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      }, { apiVersion: "v1" });
      const response = await model.generateContent(prompt);
      const result = await response.response;
      return validateResponse(JSON.parse(result.text()), MOCK_RESPONSES.STUDY_PLAN);
    });
  } catch (e) {
    return MOCK_RESPONSES.STUDY_PLAN;
  }
}

export async function generateModuleContent(moduleName: string, syllabus: string): Promise<ModuleContent> {
  if (!ai) return MOCK_RESPONSES.MODULE_CONTENT;

  return retry(async () => {
    const prompt = `Synthesize educational intel for Module: "${moduleName}".
    Syllabus Context: "${syllabus}"
    Return JSON: { notes: string, importantTopics: [string], definitions: [{term, definition}], equations: [{formula, explanation}], keyPoints: [string] }`;

    const model = ai!.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    }, { apiVersion: "v1" });
    const response = await model.generateContent(prompt);
    const result = await response.response;
    return validateResponse(JSON.parse(result.text()), MOCK_RESPONSES.MODULE_CONTENT);
  });
}

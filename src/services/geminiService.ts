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

/**
 * CORE INTELLIGENCE ROUTER
 * Prioritizes Groq (Llama 3.1 70B) and falls back to Gemini 1.5 Flash.
 */
async function callIntelligence(prompt: string, isJson: boolean = true): Promise<string> {
  const systemPrompt = "You are the ARIA Tactical Analyst. Provide precise, authoritative guidance in a futuristic, academic tone. Return only valid JSON if requested.";
  
  // PRIMARY: GROQ (Llama 3.1 70B)
  if (groq) {
    try {
      return await retry(async () => {
        const chatCompletion = await groq!.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          model: "llama-3.1-70b-versatile",
          response_format: isJson ? { type: "json_object" } : undefined,
        });
        return chatCompletion.choices[0]?.message?.content || "";
      });
    } catch (e) {
      console.warn("[Intelligence Router] Groq failed, switching to secondary signal...", e);
    }
  }

  // SECONDARY: GEMINI (1.5 Flash)
  if (ai) {
    return await retry(async () => {
      const model = ai!.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: isJson ? { responseMimeType: "application/json" } : undefined
      }, { apiVersion: "v1beta" });
      
      const response = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      const result = await response.response;
      return result.text();
    });
  }

  throw new Error("NEURAL LINK SEVERED: No AI providers available.");
}

export async function generateAudioBriefing(text: string): Promise<string> {
  try {
    const prompt = `Say in an authoritative, futuristic commander voice: "Attention Hero Scholar. Here is your tactical briefing." Then read this summary: ${text}`;
    return await callIntelligence(prompt, false);
  } catch (e) {
    return `Strategic Briefing: ${text}`;
  }
}

export async function generateFlashcards(topic: string, content: string): Promise<Flashcard[]> {
  try {
    const prompt = `Generate 8 high-stakes study flashcards for a Hero Scholar from this intelligence:
    Topic: ${topic}
    Content: ${content.substring(0, 30000)}
    Return JSON with a "flashcards" array of {question, answer}. Ensure the answer includes a deep explanation.`;

    const result = await callIntelligence(prompt);
    const data = JSON.parse(result);
    return data.flashcards || [];
  } catch (e) {
    console.error("Flashcard generation failed", e);
    return [{ question: `Identify core concepts of ${topic}`, answer: "Neural synthesis interrupted." }];
  }
}

export async function askTacticalTutor(question: string, context: string): Promise<string> {
  try {
    const prompt = `Tactical Query: "${question}"\nContext: ${context}\nProvide a direct, high-fidelity response.`;
    return await callIntelligence(prompt, false);
  } catch (e) {
    return "AI Uplink restricted. Re-establish connections.";
  }
}

export async function summarizeIntel(content: string): Promise<IntelSummary> {
  try {
    const prompt = `Perform a high-density academic synthesis of the following intelligence:
    ${content.substring(0, 40000)}
    Return JSON: { executiveSummary, criticalTakeaways: [string], actionItems: [string] }`;

    const result = await callIntelligence(prompt);
    return validateResponse(JSON.parse(result), MOCK_RESPONSES.INTEL_SUMMARY);
  } catch (e) {
    return MOCK_RESPONSES.INTEL_SUMMARY;
  }
}

export async function analyzeMissionProgress(missions: Mission[]): Promise<MissionAnalysis> {
  try {
    const prompt = `Diagnostic Scan: ${JSON.stringify(missions)}. Return JSON: { bottlenecks: [{ missionId, issue, suggestion }], victories: [{ missionId, strength }], overallStatus: string }`;
    const result = await callIntelligence(prompt);
    return validateResponse(JSON.parse(result), MOCK_RESPONSES.MISSION_ANALYSIS);
  } catch (e) {
    return MOCK_RESPONSES.MISSION_ANALYSIS;
  }
}

export async function generateStudyPlan(missions: Mission[], overallXP: number, level: number, focusTime: number): Promise<StudyPlan> {
  try {
    const prompt = `Generate study plan: Level ${level}, XP ${overallXP}, Missions ${JSON.stringify(missions)}, Time ${focusTime}m. Return JSON: { prioritizedMissions: [{ missionId, reason, priority, suggestedFocusMinutes }], strategicAdvice: string }`;
    const result = await callIntelligence(prompt);
    return validateResponse(JSON.parse(result), MOCK_RESPONSES.STUDY_PLAN);
  } catch (e) {
    return MOCK_RESPONSES.STUDY_PLAN;
  }
}

export async function generateModuleContent(moduleName: string, syllabus: string): Promise<ModuleContent> {
  try {
    const prompt = `Synthesize educational intel for Module: "${moduleName}".
    Syllabus Context: "${syllabus}"
    Return JSON: { notes: string, importantTopics: [string], definitions: [{term, definition}], equations: [{formula, explanation}], keyPoints: [string] }`;

    const result = await callIntelligence(prompt);
    return validateResponse(JSON.parse(result), MOCK_RESPONSES.MODULE_CONTENT);
  } catch (e) {
    return MOCK_RESPONSES.MODULE_CONTENT;
  }
}

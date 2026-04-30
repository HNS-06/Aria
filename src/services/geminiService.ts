import { GoogleGenAI, Type } from "@google/genai";
import Groq from "groq-sdk";
import { retry, MOCK_RESPONSES } from "./apiReliability";

let ai: any = null; // Use any to bypass strict type check if SDK is unconventional
try {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '');
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
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

const validateResponse = <T>(data: any, fallback: T): T => {
  if (!data || typeof data !== 'object') return fallback;
  return { ...fallback, ...data };
};

export async function generateAudioBriefing(text: string): Promise<string> {
  if (!ai) return `Strategic Briefing: ${text}`;
  
  return retry(async () => {
    const prompt = `Say in an authoritative, futuristic commander voice: "Attention Hero Scholar. Here is your tactical briefing." Then read this summary: ${text}`;
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text || `Briefing: ${text}`;
  });
}

export async function generateFlashcards(topic: string, concepts: string[]): Promise<Flashcard[]> {
  if (!ai) return [{ question: `Identify core concepts of ${topic}`, answer: concepts.join(", ") }];

  try {
    return await retry(async () => {
      const prompt = `Generate 5 high-stakes study flashcards for a Hero Scholar.
      Topic: ${topic}
      Concepts: ${concepts.join(', ')}`;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              flashcards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    answer: { type: Type.STRING },
                  },
                  required: ['question', 'answer'],
                },
              },
            },
            required: ['flashcards'],
          },
        }
      });
      return JSON.parse(response.text).flashcards || [];
    });
  } catch (e) {
    console.error("Flashcard generation failed, using fallback", e);
    return [{ question: `Identify core concepts of ${topic}`, answer: concepts.join(", ") }];
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
      model: "llama3-70b-8192",
    });
    return chatCompletion.choices[0]?.message?.content || "Signal interference detected.";
  });
}

export async function summarizeIntel(content: string): Promise<IntelSummary> {
  if (!ai) return MOCK_RESPONSES.INTEL_SUMMARY;

  try {
    return await retry(async () => {
      const prompt = `Extract intelligence from: ${content}`;
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              executiveSummary: { type: Type.STRING },
              criticalTakeaways: { type: Type.ARRAY, items: { type: Type.STRING } },
              actionItems: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['executiveSummary', 'criticalTakeaways', 'actionItems'],
          },
        }
      });
      return validateResponse(JSON.parse(response.text), MOCK_RESPONSES.INTEL_SUMMARY);
    });
  } catch (e) {
    return MOCK_RESPONSES.INTEL_SUMMARY;
  }
}

export async function analyzeMissionProgress(missions: Mission[]): Promise<MissionAnalysis> {
  if (!ai) return MOCK_RESPONSES.MISSION_ANALYSIS;

  try {
    return await retry(async () => {
      const prompt = `Diagnostic Scan: ${JSON.stringify(missions)}`;
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              bottlenecks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    missionId: { type: Type.NUMBER },
                    issue: { type: Type.STRING },
                    suggestion: { type: Type.STRING },
                  },
                }
              },
              victories: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    missionId: { type: Type.NUMBER },
                    strength: { type: Type.STRING },
                  },
                }
              },
              overallStatus: { type: Type.STRING },
            },
            required: ['overallStatus'],
          },
        }
      });
      return validateResponse(JSON.parse(response.text), MOCK_RESPONSES.MISSION_ANALYSIS);
    });
  } catch (e) {
    return MOCK_RESPONSES.MISSION_ANALYSIS;
  }
}

export async function generateStudyPlan(missions: Mission[], overallXP: number, level: number, focusTime: number): Promise<StudyPlan> {
  if (!ai) return MOCK_RESPONSES.STUDY_PLAN;

  try {
    return await retry(async () => {
      const prompt = `Generate study plan: Level ${level}, XP ${overallXP}, Missions ${JSON.stringify(missions)}, Time ${focusTime}m`;
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              prioritizedMissions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    missionId: { type: Type.NUMBER },
                    reason: { type: Type.STRING },
                    priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                    suggestedFocusMinutes: { type: Type.NUMBER },
                  },
                },
              },
              strategicAdvice: { type: Type.STRING },
            },
            required: ['prioritizedMissions', 'strategicAdvice'],
          },
        }
      });
      return validateResponse(JSON.parse(response.text), MOCK_RESPONSES.STUDY_PLAN);
    });
  } catch (e) {
    return MOCK_RESPONSES.STUDY_PLAN;
  }
}

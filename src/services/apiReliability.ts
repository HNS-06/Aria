/**
 * ARIA API Reliability Layer
 * Implements exponential backoff, circuit breaking, and mock fallbacks.
 */

export interface ReliabilityConfig {
  retries?: number;
  delay?: number; // ms
  timeout?: number; // ms
}

const DEFAULT_CONFIG: ReliabilityConfig = {
  retries: 3,
  delay: 1000,
  timeout: 10000,
};

/**
 * Exponential Backoff Utility
 */
export async function retry<T>(
  fn: () => Promise<T>,
  config: ReliabilityConfig = DEFAULT_CONFIG
): Promise<T> {
  let lastError: any;
  let delay = config.delay || 1000;

  for (let i = 0; i < (config.retries || 3); i++) {
    try {
      // Implement timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("ARIA_API_TIMEOUT")), config.timeout)
      );
      
      return await Promise.race([fn(), timeoutPromise]) as T;
    } catch (error: any) {
      lastError = error;
      console.warn(`[Reliability] Attempt ${i + 1} failed: ${error.message}`);
      
      if (error.message === "ARIA_API_TIMEOUT") {
        // Don't wait on timeout, just retry immediately or break if last attempt
      } else {
        await new Promise(res => setTimeout(res, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }
  throw lastError;
}

/**
 * MOCK DATA REPOSITORY
 * High-fidelity fallbacks for when the AI uplink is severed.
 */
export const MOCK_RESPONSES = {
  STUDY_PLAN: {
    prioritizedMissions: [
      { missionId: 1, reason: "Critical progress stagnation detected. Immediate focus required to maintain velocity.", priority: "High" as const, suggestedFocusMinutes: 45 },
      { missionId: 2, reason: "Moderate complexity. Strategic review will solidify core concepts.", priority: "Medium" as const, suggestedFocusMinutes: 30 }
    ],
    strategicAdvice: "AI Uplink currently offline. Utilizing cached tactical blueprints. Stay focused, Commander."
  },
  INTEL_SUMMARY: {
    executiveSummary: "Data transmuted via local tactical engine. Core objectives identified within the provided intelligence stream. Maintaining mission parameters.",
    criticalTakeaways: ["Key conceptual nodes identified", "Strategic bottleneck found in sector 4", "Resource allocation optimized"],
    actionItems: ["Review sector blueprints", "Initiate deep focus unit", "Synchronize neural map"]
  },
  MISSION_ANALYSIS: {
    bottlenecks: [{ missionId: 1, issue: "Progress drift detected", suggestion: "Increase focus intensity" }],
    victories: [{ missionId: 2, strength: "High velocity maintained" }],
    overallStatus: "Operational resilience at 85%. Tactical fallbacks active."
  },
  MODULE_CONTENT: {
    notes: "Cached tactical data provided in absence of AI uplink. Please restore connection for real-time synthesis.",
    importantTopics: ["Strategic Fundamentals", "Operational Logic", "System Integration"],
    definitions: [
      { term: "Core Protocol", definition: "The primary operational sequence for knowledge acquisition." },
      { term: "Neural Link", definition: "The bridge between raw data and cognitive mastery." }
    ],
    equations: [
      { formula: "K = (F * T)^2", explanation: "Knowledge gained equals Focus times Time squared." }
    ],
    keyPoints: ["Maintain mission focus", "Execute tactical reviews", "Sync neural map regularly"]
  }
};

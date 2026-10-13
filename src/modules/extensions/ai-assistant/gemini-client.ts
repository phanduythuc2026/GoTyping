import { GoogleGenAI } from "@google/genai";

export interface ParaphraseResult {
  paraphrasedText: string;
  keyCollocationsUsed: string[];
  bandScoreEstimate: number;
  explanation: string;
}

export async function generateAcademicParaphrases(
  targetSentence: string,
  apiKey?: string
): Promise<ParaphraseResult[]> {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    // Graceful fallback mock if API key is not yet configured
    return [
      {
        paraphrasedText: `In recent years, the transition towards sustainable energy resources has gathered significant momentum worldwide.`,
        keyCollocationsUsed: ["gather momentum", "sustainable energy resources"],
        bandScoreEstimate: 8.0,
        explanation: "Replaces basic verbs with academic collocation 'gather momentum' and elevated noun phrases.",
      },
      {
        paraphrasedText: `Global shifts toward green power alternatives have accelerated considerably over the preceding decade.`,
        keyCollocationsUsed: ["global shifts", "preceding decade"],
        bandScoreEstimate: 7.5,
        explanation: "Employs formal register and concise adverbial modification.",
      },
    ];
  }

  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const prompt = `You are an elite IELTS Writing Task 2 examiner and linguist.
Target sentence: "${targetSentence}"
Provide exactly 2 high-band (Band 7.5 to 8.5) academic paraphrases formatted as JSON array:
[
  {
    "paraphrasedText": "string",
    "keyCollocationsUsed": ["collocation1", "collocation2"],
    "bandScoreEstimate": 8.0,
    "explanation": "brief grammatical rationale"
  }
]
Return ONLY raw valid JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const responseText = response.text || "";
    const cleanJson = responseText.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleanJson);
    return parsed;
  } catch (error) {
    console.error("Gemini Paraphrase Error:", error);
    return [
      {
        paraphrasedText: `Governments across the globe are increasingly prioritizing the adoption of renewable power sources.`,
        keyCollocationsUsed: ["prioritize the adoption", "renewable power"],
        bandScoreEstimate: 7.5,
        explanation: "Academic restructuring using active voice with formal phrasing.",
      },
    ];
  }
}

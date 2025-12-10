import { GoogleGenAI, Type, Schema } from "@google/genai";
import { StudyMaterial } from "../types";

const processTranscript = async (transcript: string): Promise<StudyMaterial> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      video_overview: {
        type: Type.STRING,
        description: "A short, high-level paragraph (3-4 sentences). It should explain the core premise of the video ('What is this video about?'). Keep it simple and engaging.",
      },
      summary_markdown: {
        type: Type.STRING,
        description: "A detailed summary in Markdown format using headers (##), bullet points (*), and bold text (**).",
      },
      infographic_description: {
        type: Type.STRING,
        description: "A highly detailed visual description of an educational infographic that summarizes the key concepts. Describe the layout, central theme, icons, and connection style (e.g., 'A flat vector infographic with a central brain icon connected to 3 nodes...').",
      },
      mind_map: {
        type: Type.OBJECT,
        properties: {
          nodes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["input", "default", "output"] },
                label: { type: Type.STRING },
              },
              required: ["id", "type", "label"],
            },
          },
          edges: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                source: { type: Type.STRING },
                target: { type: Type.STRING },
                label: { type: Type.STRING },
              },
              required: ["id", "source", "target"],
            },
          },
        },
        required: ["nodes", "edges"],
      },
      quiz: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            question_text: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            correct_option_index: { type: Type.INTEGER },
            explanation: { type: Type.STRING },
          },
          required: ["id", "question_text", "options", "correct_option_index", "explanation"],
        },
      },
      case_study: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          executive_summary: { type: Type.STRING },
          problem_statement: { type: Type.STRING },
          methodology_solution: { type: Type.STRING },
          key_findings: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          conclusion: { type: Type.STRING },
        },
        required: ["title", "executive_summary", "problem_statement", "methodology_solution", "key_findings", "conclusion"],
      },
    },
    required: ["video_overview", "summary_markdown", "mind_map", "quiz", "infographic_description", "case_study"],
  };

  const systemInstruction = `
    Role: You are an advanced Educational AI Assistant designed to process video transcripts into structured learning data.
    
    Task: Analyze the provided video transcript and generate a JSON object containing a Video Overview, Summary, Infographic Description, Mind Map structure, Quiz, and a formal Case Study.
    
    1. "video_overview": A short, high-level paragraph (3-4 sentences). It should explain the core premise of the video ('What is this video about?'). Keep it simple and engaging.
    2. "summary_markdown": A detailed Markdown summary. Use Headers (##) for main topics, bullet points (*) for details, and bold (**) for terms.
    3. "infographic_description": A creative and detailed text prompt describing a visual infographic for the content. This will be used by an image generation model. Specify "flat vector style", specific colors, and layout.
    4. "mind_map": Data for a node-graph. Nodes must be hierarchical (Root -> Category -> Detail).
    5. "quiz": 5 multiple-choice questions.
    6. "case_study": Create a formal report based on the video. Adapt informal content to professional structure. Include a formal title, executive summary, problem statement, detailed methodology/solution, key findings (3-5 points), and conclusion.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: transcript,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as StudyMaterial;
  } catch (error) {
    console.error("Error generating study material:", error);
    throw error;
  }
};

const generateInfographic = async (prompt: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: prompt }],
      },
    });

    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          return `data:${mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Error generating infographic:", error);
    throw error;
  }
};

const generateSummaryVideo = async (overviewText: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    // 1. Initiate Video Generation
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `A cinematic educational video concept for: ${overviewText}. High quality, clear visuals.`,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    // 2. Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
      operation = await ai.operations.getVideosOperation({ operation: operation });
      console.log('Video generation status:', operation.metadata?.state);
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error("Video generation completed but no URI returned.");
    }

    // 3. Download the video bytes (Requires API Key appended)
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error("Error generating video:", error);
    throw error;
  }
};

export { processTranscript, generateInfographic, generateSummaryVideo };

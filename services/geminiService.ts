import { GoogleGenAI, Type } from "@google/genai";
import type { Slide } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const prompt = `
You are an expert instructional designer. Your task is to take the following text and create a script for an educational video. The output must be a single, valid JSON object that adheres to the provided schema.

The JSON object should be an array of "slide" objects. Each slide object represents a segment of the video.

Analyze the provided text and structure it into a logical sequence of 5 to 7 slides. A good video should have an introduction, key concepts explained with visuals, and a conclusion. Use a mix of text slides and visual slides (BAR_CHART, LINE_CHART, FLOWCHART) where appropriate to make the content engaging.

For chart data, if no explicit data is present in the source text, create representative sample data that illustrates the concept being discussed. When creating charts, also provide brief, descriptive titles for the X and Y axes. For flowcharts, identify processes or sequences in the text.

Here is the text to analyze:
---
{TEXT_CONTENT}
---
`;

export const generateVideoScript = async (textContent: string): Promise<Slide[]> => {
  const filledPrompt = prompt.replace('{TEXT_CONTENT}', textContent);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: filledPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ['TEXT', 'BAR_CHART', 'LINE_CHART', 'FLOWCHART'] },
              title: { type: Type.STRING },
              narration: { type: Type.STRING },
              content: { type: Type.STRING, description: "Markdown-formatted text for TEXT slides." },
              data: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    value: { type: Type.NUMBER }
                  },
                  required: ["name", "value"]
                },
                description: "Data for BAR_CHART or LINE_CHART slides."
              },
              xAxisTitle: { type: Type.STRING, description: "A descriptive title for the X-axis of a chart." },
              yAxisTitle: { type: Type.STRING, description: "A descriptive title for the Y-axis of a chart." },
              nodes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    label: { type: Type.STRING }
                  },
                  required: ["id", "label"]
                },
                description: "Nodes for FLOWCHART slides."
              },
              edges: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    from: { type: Type.STRING },
                    to: { type: Type.STRING },
                    label: { type: Type.STRING }
                  },
                  required: ["from", "to"]
                },
                description: "Edges connecting nodes for FLOWCHART slides."
              }
            },
            required: ["type", "title", "narration"]
          }
        },
      },
    });

    const jsonText = response.text.trim();
    const script = JSON.parse(jsonText) as Slide[];
    return script;
  } catch (error) {
    console.error("Error generating video script:", error);
    throw new Error("Failed to parse response from Gemini API.");
  }
};
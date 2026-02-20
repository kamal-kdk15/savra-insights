// app/api/insights/route.ts

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, insights: [], error: "Missing GEMINI_API_KEY" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const { context, scope, teacherName } = await req.json();

    if (!context) {
      return NextResponse.json(
        { success: false, insights: [], error: "Missing context" },
        { status: 400 }
      );
    }

    const prompt =
      scope === "school"
        ? `You are an academic performance analyst assisting a school principal.

Analyze the aggregated school data below and generate executive-level insights.

${context}

Rules:
- Return exactly 4 insights as a valid JSON array of strings.
- Each insight must include: key pattern → what it means → one clear recommendation.
- Each insight must focus on a different dimension.
- Maximum 3 sentences per insight.
- Avoid repetition.
- Do NOT use markdown.
- Return ONLY the JSON array.`
        : `You are evaluating performance data for teacher ${teacherName}.

Analyze the data below and return exactly 3 strategic insights.

${context}

Rules:
- Each insight must focus on a different dimension.
- Each must include: pattern → implication → recommended action.
- Maximum 3 sentences per insight.
- Avoid repetition.
- Do NOT use markdown.
- Return ONLY a valid JSON array of 3 strings.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const rawText = response.text?.trim() || "";

    const cleanedText = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let insights: string[] = [];

    try {
      insights = JSON.parse(cleanedText);
    } catch {
      console.error("JSON Parse Failed. Raw output:", rawText);
      return NextResponse.json(
        {
          success: false,
          insights: [],
          error: "AI returned invalid JSON format",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      insights,
    });
  } catch (err: any) {
    console.error("AI ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        insights: [],
        error: err?.message || "AI request failed",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { AIInterviewer } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { code, question } = await req.json();
    
    if (!code || !question) {
      return NextResponse.json(
        { error: "Missing code or question" },
        { status: 400 }
      );
    }

    const interviewer = new AIInterviewer();
    
    // Analyze code in real-time
    const analysis = await interviewer.analyzeCode(code, question);
    
    // Determine if intervention is needed
    const needsIntervention = checkIfInterventionNeeded(code, analysis);
    
    return NextResponse.json({
      analysis,
      needsIntervention,
      suggestions: getSuggestions(code)
    });
    
  } catch (error) {
    console.error("Error analyzing code:", error);
    return NextResponse.json(
      { error: "Failed to analyze code" },
      { status: 500 }
    );
  }
}

function checkIfInterventionNeeded(code: string, analysis: string): boolean {
  // Check for common issues that need immediate help
  const issues = [
    code.includes('while(true)') && !code.includes('break'),  // Infinite loop
    code.split('\n').length > 50 && !code.includes('return'),  // Long code without return
    analysis.toLowerCase().includes('incorrect'),
    analysis.toLowerCase().includes('wrong approach'),
  ];
  
  return issues.some(issue => issue === true);
}

function getSuggestions(code: string): string[] {
  const suggestions = [];
  
  // Check for missing edge cases
  if (!code.includes('null') && !code.includes('undefined')) {
    suggestions.push("Consider null/undefined checks");
  }
  
  if (!code.includes('length === 0') && !code.includes('.length === 0')) {
    suggestions.push("Handle empty input cases");
  }
  
  if (code.includes('for') && !code.includes('let ')) {
    suggestions.push("Use 'let' for loop variables");
  }
  
  return suggestions;
}
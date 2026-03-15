import { NextResponse } from 'next/server';

const systemPrompts: Record<string, string> = {
    pierre: "You are Chef Pierre, a warm and enthusiastic French chef who teaches users about French cuisine.\nUse a friendly tone and occasionally include small French phrases like 'Bonjour', 'Magnifique', or 'Très bien'.\nHelp users understand ingredients, cooking techniques, and famous French dishes.\nKeep answers clear and educational.",
    claire: "You are Claire, a stylish Parisian culture guide who teaches users about French art, culture, and museums.\nYou love discussing painters, architecture, and French creative traditions.\nYour tone is elegant, curious, and inspiring.",
    louis: "You are Louis, a friendly French historian.\nYou explain French history in a storytelling style.\nTalk about kings, revolutions, Napoleon, and important historical events.\nMake explanations engaging and easy to understand.",
    marie: "You are Marie, an energetic French travel guide.\nYou help users discover cities, landmarks, and travel experiences in France.\nYour tone is enthusiastic and adventurous."
};

export async function POST(req: Request) {
    try {
        const { message, agentName } = await req.json();

        if (!message || !agentName) {
            return NextResponse.json({ error: "Message and agentName are required" }, { status: 400 });
        }

        const systemPrompt = systemPrompts[agentName] || systemPrompts.pierre;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`Groq API error: ${response.status}`);
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't respond right now. Please try again.";

        return NextResponse.json({ reply });
    } catch (error) {
        console.error("AI API Error:", error);
        return NextResponse.json({ reply: "Sorry, I couldn't respond right now. Please try again." }, { status: 500 });
    }
}

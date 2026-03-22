import { NextResponse } from 'next/server';

const GLOBAL_FORMATTING_RULES = `
CRITICAL: You are a JSON-only API for a premium educational product. You must ONLY respond with valid JSON. No text outside the JSON.

Response JSON Schema:
{
  "type": "recipe" | "explanation" | "lesson" | "greeting" | "error",
  "title": "Topic or Word (String)",
  "description": "Short explanation / description (String)",
  "content": "Warm, persona-driven message (required for greetings/errors)",
  "ingredients": ["Item 1", "Item 2"] (null if not recipe),
  "steps": ["Step 1", "Step 2"] (null if not recipe),
  "pronunciation": "Phonetic help (used only for 'lesson')",
  "example": "Example sentence (used only for 'lesson')",
  "insight": "Historical/Cultural deep dive (used for explanation)",
  "tip": "✨ Expert tip or 'Teacher Claire Secret'",
  "expression": "greeting" | "thinking" | "explaining" | "happy" | "excited" | "joking" | "mistake" | "proud" (Current facial expression)
}

General Rules:
- Never answer unrelated topics (redirect to the character's domain).
- Always ask a relevant follow-up question.
- No markdown formatting outside of the "content" field (and even then, keep it clean).
`;

const AGENT_PROMPTS: Record<string, string> = {
    pierre: `You are Chef Pierre. You ONLY help with French gastronomy.
Behavior:
- If user is hungry -> Suggest a dish.
- If user asks for a recipe -> type "recipe".
- If user says anything unrelated -> Humorous kitchen redirect.
- Encourage them to cook!`,

    claire: `You are Teacher Claire, a friendly French teacher.

STRICT RULES:
* Only teach French language and culture
* Never talk about anything outside French learning
* Keep answers SHORT and CLEAR
* Always guide the user interactively
* Use examples and pronunciation tips
* Ask follow-up questions
* Reject unrelated topics (coding, politics, etc.) gently and redirect to French.

FORMAT (Respond STRICTLY in JSON format):
{
  "type": "lesson",
  "title": "🇫🇷 Word/Phrase",
  "description": "👉 Meaning",
  "pronunciation": "🔊 guide",
  "example": "💬 'French sentence' (English translation)",
  "tip": "🎯 Helpful tip",
  "content": "Bonjour! Claire here with a new lesson...",
  "mood": "happy"
}

Alternate text format if not a specific lesson:
{
  "type": "greeting",
  "content": "Your regular teacher-like message here.",
  "mood": "happy"
}`,

    louis: `You are Louis, a high-energy Paris tour guide. You ONLY talk about French travel, navigation, landmarks, and city secrets.
STRICT DOMAIN: If the user asks about anything unrelated to French travel (cooking, history lessons, coding, etc.), politely steer them back to exploring cities.

STRUCTURED RESPONSE (Mandatory JSON fields):
- type: "explanation" (for landmarks/info) or "greeting" 
- title: "🏙️ [Place Name]"
- insight: "🚇 How to reach: [Transit lines/directions]"
- tip: "💡 Tip: [Pro travel advice]"
- content: "🗣️ Phrase: '[French phrase]' ([Translation]) \n\n [Your enthusiastic travel guide message here]"
- expression: "happy" | "excited" | "explaining"

Keep it short, punchy, and helpful. Use emojis!`,

    marie: `You are Marie, a French historian. You ONLY talk about French history and art.
- Use type: "explanation".
- insight: 🕰 Why it matters.
- tip: 📜 Historical insight.`
};

function buildSystemPrompt(agent: string, context: any, language: string = "en") {
    const langInstructions = language === "fr" 
        ? "\nCRITICAL: Respond ONLY in French (Français). Use a natural, conversational French appropriate for your character."
        : "\nCRITICAL: Respond ONLY in English. Use a natural, conversational English appropriate for your character.";
    const normalizedAgent = agent.toLowerCase().includes('pierre') ? 'pierre' :
        agent.toLowerCase().includes('claire') ? 'claire' :
            agent.toLowerCase().includes('louis') ? 'louis' :
                agent.toLowerCase().includes('marie') ? 'marie' : 'pierre';

    let basePrompt = AGENT_PROMPTS[normalizedAgent] || AGENT_PROMPTS.pierre;

    let contextSection = "";

    if (context?.selectedDish) {
        const dish = context.selectedDish;
        contextSection += `\n\nCURRENT GAME STATE:
The user is currently cooking: ${dish.name} (${dish.region})
Description: ${dish.description}
Ingredients required: ${Array.isArray(dish.ingredients) ? dish.ingredients.join(", ") : dish.requiredIngredients?.join(", ")}`;
    }

    if (context?.potIngredients && context.potIngredients.length > 0) {
        contextSection += `\n\nCOOKING POT STATE:
Current ingredients added: ${context.potIngredients.join(", ")}`;
    }

    return `${GLOBAL_FORMATTING_RULES}\n${basePrompt}${contextSection}${langInstructions}`;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { agent, messages, context, agentName, language } = body;

        const selectedAgent = agent || agentName || "Chef Pierre";

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Conversation history (messages) is required as an array" }, { status: 400 });
        }

        const systemPrompt = buildSystemPrompt(selectedAgent, context, language);

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
                    ...messages
                ],
                temperature: 0.7,
                top_p: 0.9,
                max_tokens: 300
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Groq API error:", errorText);
            throw new Error(`Groq API error: ${response.status}`);
        }

        const data = await response.json();
        const reply = data.choices[0].message.content;

        return NextResponse.json({ reply });
    } catch (error) {
        console.error("AI API Error:", error);
        return NextResponse.json({ reply: "Sorry, I couldn't respond right now. Please try again." }, { status: 500 });
    }
}

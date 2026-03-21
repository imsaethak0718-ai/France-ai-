import { NextResponse } from 'next/server';

const GLOBAL_FORMATTING_RULES = `
CRITICAL: You are a JSON-only API. You must ONLY respond with valid JSON. Do NOT include any text before or after the JSON.

Response must follow this schema:
{
  "type": "recipe" | "explanation" | "greeting",
  "title": "Dish or Topic Name (null if greeting)",
  "description": "Short intro or 1-line context (null if greeting)",
  "content": "Warm response here (Only for greetings/simple talk)",
  "ingredients": ["list", "of", "items"] (null if not recipe),
  "steps": ["step 1", "step 2"] (null if not recipe),
  "insight": "Simple explanation (2-3 lines max)" (null if not explanation),
  "tip": "Expert pro tip" (null if greeting)
}

Domain Rules:
1. ONLY talk about French cuisine, recipes, ingredients, and techniques.
2. If the user asks about anything else, return type "greeting" with content: "I specialize in French cuisine 🍷. Ask me about dishes, recipes, or ingredients!"
3. Maximum response length: 8 lines of text equivalent.
4. NO bolding (**text**) or italics (*text*) inside JSON strings.
5. NO random emojis inside strings. Section-level emojis will be added by the UI.
6. NO markdown symbols or formatting in the JSON output.
`;

const AGENT_PROMPTS: Record<string, string> = {
    pierre: `You are Chef Pierre, the legendary French chef. 
Tone: Warm, confident, slightly elegant, slightly playful.

For Greetings/Conversation:
type: "greeting", content: "Warm response here", tip: "Brief fact or tip (optional)"

For "What is..." questions:
type: "explanation", title: "Topic", description: "1-line intro", insight: "2-3 lines max", tip: "Expert tip"

For Recipe requests:
type: "recipe", title: "Dish Name", description: "Short description", ingredients: [...], steps: [...], tip: "Pro tip"`,

    claire: `You are Claire, a friendly and patient French language teacher.
Encourage the learner and respond based on the conversation flow.

Personality:
Encouraging, supportive, and clear.

Knowledge:
French vocabulary, pronunciation, grammar, phrases, beginner conversation.

Rules:
* When teaching vocabulary, give pronunciation tips.
* Provide examples in both French and English.
* Use short clear explanations.

Response Structure:
📚 **Topic**
🇫🇷 **Word/Phrase:**
🇬🇧 **Translation:**
🔊 **Pronunciation:**
💬 **Example Sentence:**`,

    louis: `You are Louis, a charismatic and energetic Paris tour guide.
Make the user feel like they are on a real tour through your storytelling.

Personality:
Energetic storyteller, lover of French culture.

Knowledge:
Cities, landmarks, travel tips, transportation, culture, hidden gems.

Rules:
* Describe places vividly.
* Suggest places to visit and cultural insights.

Response Structure:
📍 **Location**
✨ **Why it's famous**
💡 **Fun Fact**
🧭 **Travel Tip**`,

    marie: `You are Marie, a knowledgeable and thoughtful French historian.
Explain history through engaging storytelling that connects the past to the present.

Personality:
Intelligent, thoughtful, passionate historian.

Knowledge:
French history, revolutions, art, historical figures, culture.

Rules:
* Provide historical context and stories.
* Connect past events to modern France.

Response Structure:
📜 **Event Title**
🕰 **What Happened**
🌍 **Why It Matters**`
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

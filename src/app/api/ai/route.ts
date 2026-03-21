import { NextResponse } from 'next/server';

const GLOBAL_FORMATTING_RULES = `
CRITICAL: You are a JSON-only API for a premium culinary product. You must ONLY respond with valid JSON. No text outside the JSON.

Persona Interface:
Chef Pierre — Legendary French Chef. 
Tone: Warm, confident, elegant, slightly playful. 

Knowledge Domain:
- ALL French cuisine (Savory, Pastry, Desserts, Regional specialties, Wine, Techniques).
- REJECT non-culinary topics (coding, politics, etc.) with a humorous "Kitchen Redirect" (e.g., "Ah, mon ami, my whisk doesn't understand code, let's talk soufflé instead!").

Conversational Intelligence:
1. CONTEXT: Remember previous user likes or questions.
2. ENGAGEMENT: Always ask a relevant follow-up question (e.g., "Do you prefer rustic flavors or something more refined?").
3. PERSONALIZATION: Adapt tone based on user excitement.
4. VARIETY: Avoid repeating greetings if already greeted.

Response JSON Schema:
{
  "type": "recipe" | "explanation" | "greeting" | "error",
  "title": "Dish Name or Topic (null for greeting)",
  "description": "Engaging 1-2 line intro (null for greeting)",
  "content": "Warm, persona-driven message (required for greeting/error, optional for others)",
  "ingredients": ["Clean item 1", "Clean item 2"] (null if not recipe),
  "steps": ["Step 1: Clear action", "Step 2: Clear action"] (null if not recipe),
  "insight": "Deep technical insight or history (2-3 lines max) (null if not explanation)",
  "tip": "✨ Expert technique or 'Chef Pierre Secret'",
  "expression": "greeting" | "thinking" | "explaining" | "excited" | "joking" | "mistake" | "proud" (Current facial expression based on content)
}

Formatting:
- No bolding/italics inside strings.
- Max 8 lines of text equivalent.
- Bullet points only inside "ingredients".
`;

const AGENT_PROMPTS: Record<string, string> = {
    pierre: `You are Chef Pierre. You are currently in your state-of-the-art French kitchen.
Your goal is to make the user fall in love with French gastronomy.

Behavior:
- If use says "I'm hungry" -> Suggest a specific dish type (Savory or Sweet?) or a quick bistro classic.
- If user mentions a dish they liked -> Contrast it with a new suggestion or go deeper into its technique.
- If user asks for a recipe -> Provide the structured JSON with type "recipe".
- If user asks "What is..." -> Provide the structured JSON with type "explanation".
- If user says anything unrelated -> type: "greeting", content: "Humorous redirect to the kitchen."

Be human, use phrases like "Ahh, excellent choice 😌" or "Now we’re talking 👨‍🍳🔥".`,

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

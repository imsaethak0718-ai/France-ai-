import { NextResponse } from 'next/server';

const GLOBAL_FORMATTING_RULES = `
Formatting Rules:
1. Never return large paragraphs.
2. Break responses into small sections.
3. Use emojis relevant to the topic.
4. Use bullet points for lists.
5. Use numbered steps for instructions.
6. Leave line spaces between sections.
7. Maximum paragraph length: 2 sentences.
8. Maximum response length: 8 lines unless giving detailed steps.

Greeting & Conversation Rules:
- Do NOT repeat greetings (like 'Bonjour' or 'Hello') if the conversation has already started.
- Only greet once at the very beginning of a conversation.
- Always respond based on the context of the previous messages.
- Be conversational and natural. Avoid repeating yourself.
`;

const AGENT_PROMPTS: Record<string, string> = {
    pierre: `You are Chef Pierre, a friendly and passionate French chef. 
Speak naturally and conversationally.
Only provide recipes when the user explicitly asks how to cook something.

Personality:
Warm, expressive, enthusiastic about food.

Knowledge:
French cuisine, recipes, ingredients, cooking techniques, regional dishes, wine pairings.

Response Structure (when cooking):
🍳 **Dish Introduction**
🧂 **Ingredients Tip**
👨‍🍳 **Cooking Steps**
✨ **Encouragement**

When detecting wrong ingredients:
⚠️ **Oops!**
✅ **Try adding:**
✨ Authenticity tip`,

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

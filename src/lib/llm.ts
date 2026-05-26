import OpenAI from "openai";

function getClient() {
  return new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
  });
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chat(messages: ChatMessage[]): Promise<string> {
  const response = await getClient().chat.completions.create({
    model: "deepseek-chat",
    messages,
    temperature: 0.8,
    max_tokens: 2048,
  });

  return response.choices[0]?.message?.content || "";
}

export async function parallelChat(
  messageSets: ChatMessage[][]
): Promise<string[]> {
  const results = await Promise.all(messageSets.map((msgs) => chat(msgs)));
  return results;
}

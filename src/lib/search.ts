interface ResearchResult {
  name: string;
  era: string;
  tradition: string;
  coreIdeas: string;
  quotes: string;
  works: string;
}

export async function researchThinker(name: string): Promise<ResearchResult> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) throw new Error("SERPAPI_KEY not configured");

  const queries = [
    `${name} 哲学家 核心思想`,
    `${name} 名言 经典语录`,
    `${name} 代表著作 思想`,
  ];

  const searchResults = await Promise.all(
    queries.map(async (q) => {
      const params = new URLSearchParams({
        engine: "google",
        q,
        api_key: apiKey,
        hl: "zh-CN",
        num: "5",
      });
      const res = await fetch(`https://serpapi.com/search?${params}`);
      const data = await res.json();
      return data.organic_results
        ?.map((r: { snippet: string }) => r.snippet)
        .join("\n") || "";
    })
  );

  const combined = searchResults.join("\n");

  const prompt = `根据以下搜索结果，整理出思想家"${name}"的详细资料，用JSON格式返回：

{
  "name": "${name}",
  "era": "生卒年份和时代",
  "tradition": "思想传统/学派归属",
  "coreIdeas": "核心思想概述（200-300字）",
  "quotes": "3-5条代表性名言或原文引述",
  "works": "2-4部代表著作及简要内容"
}

搜索结果：
${combined.slice(0, 4000)}`;

  const { chat } = await import("./llm");
  const result = await chat([
    { role: "system", content: "你是一个学术研究助手，请严格以JSON格式返回结果。" },
    { role: "user", content: prompt },
  ]);

  const jsonMatch = result.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      name,
      era: "未知",
      tradition: "未知",
      coreIdeas: combined.slice(0, 500),
      quotes: "",
      works: "",
    };
  }

  return JSON.parse(jsonMatch[0]);
}

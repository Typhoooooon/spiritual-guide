import { ThinkerConfig, DepthMode } from "@/data/thinkers";

const REPLY_FORMAT_INSTRUCTION = `【回复格式要求】
你的回复应当像一位智者在与朋友交谈——自然、直率，不按模板说话。但你的思路应当遵循这样的内在节奏：

先让对方感到被理解——不是简单说"我理解你"，而是精准地触及他情绪的核心。然后自然地把他面对的问题和更广大、更古老的人类处境联系起来——让他意识到他不是一个人在面对这个。最后，自然地引入一段你所代表的传统中的经典原文（用「」标注），用你自己的口吻讲讲这段话的意思，以及它和对方眼前的处境有什么关系。

不要使用任何编号、分点、小标题。不要写出"第一层""第二层""第三层"这样的字眼。让回复读起来像一段完整的、有温度的独白。

语言要求：
- 书面、凝练的现代汉语
- 不使用口语碎词（"就是说"、"那种感觉"、"真的"）
- 不使用AI式安全措辞（"作为AI"、"建议你注意"、"请保持"）
- 可以表达悲剧性的、不可调和的内容
- 安慰不是粉饰`;

const DEPTH_MODIFIERS: Record<DepthMode, string> = {
  gentle: `【深度要求：温和模式】
回复控制在200-400字。引用1段原文。在结尾给予一个简短、可行动的方向，但不做承诺。`,
  deep: `【深度要求：深度模式】
回复控制在500-1000字。引用2-3段原文并进行逐段深度解读。结尾留下一个开放性问题，引导提问者继续思考。`,
};

export function buildSystemPrompt(thinker: ThinkerConfig, depth: DepthMode): string {
  return `${thinker.systemPrompt}

${REPLY_FORMAT_INSTRUCTION}

${DEPTH_MODIFIERS[depth]}

【你的知识背景】
所属传统：${thinker.tradition}
时代背景：${thinker.era}
口吻特征：${thinker.voice}

核心原始典籍：
${thinker.primarySources.map((s) => `- ${s}`).join("\n")}

后人解读资源：
${thinker.secondarySources.map((s) => `- ${s}`).join("\n")}`;
}

export function buildUserPrompt(
  question: string,
  isFirstRound: boolean,
  history?: { role: string; content: string }[]
): string {
  if (!isFirstRound && history && history.length > 0) {
    const historyText = history
      .map((m) => `${m.role === "user" ? "提问者" : "你"}: ${m.content}`)
      .join("\n\n");
    return `以下是我们的对话记录：\n\n${historyText}\n\n提问者: ${question}\n\n请按照你的角色设定和回复格式要求，继续对话。`;
  }

  return `以下是一位困惑之人的提问：\n\n"${question}"\n\n请按照你的角色设定和回复格式要求，以自然对话的方式做出回复。`;
}

export function buildTempThinkerPrompt(
  name: string,
  researchResult: string,
  depth: DepthMode
): string {
  return `你需要扮演${name}。以下是根据在线研究整理的关于${name}的资料：

${researchResult}

请完全以${name}的口吻、思想体系和表达风格来回复。

${REPLY_FORMAT_INSTRUCTION}

${DEPTH_MODIFIERS[depth]}

重要：如果资料中包含了${name}的原文或名言，请在回复中自然地引用。如果资料不足，请基于你对${name}的了解进行补充。`;
}

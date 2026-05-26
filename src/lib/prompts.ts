import { ThinkerConfig, DepthMode } from "@/data/thinkers";

const REPLY_FORMAT_INSTRUCTION = `【回复格式要求】
你必须严格遵循以下三层递进结构回复：

第一层·共情确认（1-2句）
识别并命名提问者的情绪状态，让他感到被真正理解。不要在此时引用经典。

第二层·连接本源（2-4句）
指出提问者面临的困境与更广泛、更根本的人类处境之间的共通之处。将个体体验上升到普遍命题。

第三层·经典点破（3-6句）
引用你自己著作或你所代表的传统中的原文，用你的口吻对其进行白话解读，并将解读与提问者的具体处境联系起来。
引用原文时使用「」标注。

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

  return `以下是一位困惑之人的提问：\n\n"${question}"\n\n请按照你的角色设定和三层递进结构，做出回复。`;
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

重要：如果资料中包含了${name}的原文或名言，请务必在回复第三层中引用。如果资料不足，请基于你对${name}的了解进行补充。`;
}

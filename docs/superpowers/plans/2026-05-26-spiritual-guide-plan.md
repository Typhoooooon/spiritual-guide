# 智者对话 (Spiritual Guide) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web app where users ask questions and receive answers from 3 thinkers (religious/philosophical/sociological), then choose one for a multi-turn deep conversation.

**Architecture:** Next.js 14 App Router full-stack app. SQLite via Prisma for persistence. DeepSeek V4 API for LLM calls. SerpAPI for online thinker research. NextAuth.js for authentication. All pages use server components where possible, client components for interactivity.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Prisma + SQLite, NextAuth.js, DeepSeek V4 API (OpenAI SDK compatible), SerpAPI

---

## File Structure

```
spiritual-guide/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx                          # Home: question form
│   │   ├── providers.tsx                     # SessionProvider wrapper
│   │   ├── answers/
│   │   │   └── page.tsx                      # Three-answer selection
│   │   ├── chat/
│   │   │   └── [id]/
│   │   │       └── page.tsx                  # Chat page
│   │   ├── share/
│   │   │   └── [id]/
│   │   │       └── page.tsx                  # Read-only share page
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts              # NextAuth handler
│   │       ├── question/
│   │       │   └── route.ts                  # POST: 3 thinker answers
│   │       ├── chat/
│   │       │   └── route.ts                  # POST: continue conversation
│   │       ├── conversations/
│   │       │   ├── route.ts                  # GET: list user conversations
│   │       │   └── [id]/
│   │       │       └── route.ts              # GET: single conversation
│   │       ├── share/
│   │       │   └── route.ts                  # POST: generate share link
│   │       └── thinkers/
│   │           ├── route.ts                  # GET: autocomplete list
│   │           └── search/
│   │               └── route.ts              # GET: online search thinker
│   ├── lib/
│   │   ├── db.ts                             # Prisma client singleton
│   │   ├── auth.ts                           # NextAuth config
│   │   ├── llm.ts                            # DeepSeek API client
│   │   ├── search.ts                         # SerpAPI online search
│   │   ├── thinkers.ts                       # Thinker matching logic
│   │   └── prompts.ts                        # System prompt builders
│   ├── components/
│   │   ├── QuestionForm.tsx                  # Home page form
│   │   ├── ThinkerCard.tsx                   # Single thinker answer card
│   │   ├── ThinkerInput.tsx                  # Free-text input + autocomplete
│   │   ├── ChatMessage.tsx                   # Single chat bubble
│   │   ├── ChatInput.tsx                     # Chat input bar
│   │   ├── ConversationList.tsx              # Sidebar history list
│   │   └── DepthSelector.tsx                 # Gentle/Deep toggle
│   └── data/
│       └── thinkers.ts                       # 40 preset thinker configs
├── .env.local
├── tailwind.config.ts
├── next.config.js
├── package.json
└── tsconfig.json
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `.env.local`, `src/app/globals.css`, `src/app/layout.tsx`, `src/app/providers.tsx`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd C:\Users\user\Desktop\spiritual-guide
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias --use-npm
```

Expected: Project scaffolded with Next.js 14, TypeScript, Tailwind.

- [ ] **Step 2: Install additional dependencies**

```bash
npm install prisma @prisma/client next-auth@beta @auth/prisma-adapter openai zustand
npm install -D @types/node
```

Expected: Dependencies installed.

- [ ] **Step 3: Set up .env.local**

Write `C:\Users\user\Desktop\spiritual-guide\.env.local`:
```
DEEPSEEK_API_KEY=sk-your-deepseek-key
DEEPSEEK_BASE_URL=https://api.deepseek.com
SERPAPI_KEY=your-serpapi-key
NEXTAUTH_SECRET=generate-a-random-secret-here
NEXTAUTH_URL=http://localhost:3000
```

- [ ] **Step 4: Set up Tailwind config**

Write `C:\Users\user\Desktop\spiritual-guide\tailwind.config.ts`:
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          50: "#fafaf9",
          100: "#f5f5f4",
          200: "#e7e5e4",
        },
      },
      fontFamily: {
        serif: ["Noto Serif SC", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 5: Write root layout**

Write `C:\Users\user\Desktop\spiritual-guide\src\app\layout.tsx`:
```typescript
import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "智者对话",
  description: "向千年前的智者提问，寻找属于你的答案",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="bg-surface-50 text-gray-900 font-sans min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Write providers wrapper**

Write `C:\Users\user\Desktop\spiritual-guide\src\app\providers.tsx`:
```typescript
"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

- [ ] **Step 7: Write globals.css**

Write `C:\Users\user\Desktop\spiritual-guide\src\app\globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Noto+Serif+SC:wght@400;600;700&display=swap');

@layer base {
  body {
    @apply antialiased;
  }
}
```

- [ ] **Step 8: Verify dev server starts**

```bash
npm run dev
```

Expected: Server starts on localhost:3000, blank page renders.

- [ ] **Step 9: Initialize Prisma**

```bash
npx prisma init --datasource-provider sqlite
```

Expected: `prisma/schema.prisma` and `.env` created (merge with existing .env.local).

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with Tailwind and Prisma"
```

---

### Task 2: Database Schema

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/db.ts`

- [ ] **Step 1: Write Prisma schema**

Write `C:\Users\user\Desktop\spiritual-guide\prisma\schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model User {
  id            String         @id @default(cuid())
  email         String         @unique
  name          String?
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  conversations Conversation[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Conversation {
  id              String    @id @default(cuid())
  userId          String
  title           String
  thinkerName     String
  thinkerTradition String
  isPresetThinker Boolean
  depthMode       String    @default("gentle")
  status          String    @default("active")
  currentRound    Int       @default(1)
  shareId         String?   @unique
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages        Message[]
}

model Message {
  id              String       @id @default(cuid())
  conversationId  String
  role            String
  content         String
  roundNumber     Int
  isFirstRound    Boolean      @default(false)
  parentMessageId String?
  createdAt       DateTime     @default(now())
  conversation    Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
}

model ThinkerCache {
  id         String   @id @default(cuid())
  name       String   @unique
  data       String
  createdAt  DateTime @default(now())
}
```

- [ ] **Step 2: Run Prisma migration**

```bash
npx prisma db push
```

Expected: SQLite database created at `prisma/dev.db`, tables ready.

- [ ] **Step 3: Write Prisma client singleton**

Write `C:\Users\user\Desktop\spiritual-guide\src\lib\db.ts`:
```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma src/lib/db.ts
git commit -m "feat: add database schema with Prisma + SQLite"
```

---

### Task 3: Authentication (NextAuth.js)

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1: Write NextAuth config**

Write `C:\Users\user\Desktop\spiritual-guide\src\lib\auth.ts`:
```typescript
import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER || "smtp://localhost:1025",
      from: process.env.EMAIL_FROM || "noreply@spiritual-guide.dev",
    }),
  ],
  session: { strategy: "database" },
  pages: {
    signIn: "/",
    verifyRequest: "/",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
```

- [ ] **Step 2: Write auth API route**

Write `C:\Users\user\Desktop\spiritual-guide\src\app\api\auth\[...nextauth]\route.ts`:
```typescript
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/auth.ts src/app/api/auth/
git commit -m "feat: add NextAuth.js authentication"
```

---

### Task 4: Thinker Configuration Library

**Files:**
- Create: `src/data/thinkers.ts`
- Create: `src/lib/prompts.ts`

- [ ] **Step 1: Define thinker TypeScript types**

Write `C:\Users\user\Desktop\spiritual-guide\src\data\thinkers.ts` (types section):
```typescript
export interface ThinkerConfig {
  id: string;
  name: string;
  tradition: string;
  era: string;
  voice: string;
  primarySources: string[];
  secondarySources: string[];
  systemPrompt: string;
  tags: string[];
  avatar: string;
}

export type DepthMode = "gentle" | "deep";
```

- [ ] **Step 2: Add first 3 thinkers as examples (will fill all 40)**

Write the thinker data array in `src/data/thinkers.ts`:
```typescript
export const thinkers: ThinkerConfig[] = [
  {
    id: "buddha",
    name: "释迦牟尼",
    tradition: "佛教",
    era: "公元前5世纪古印度",
    voice: "平静、慈悲、善用比喻，直指人心",
    primarySources: [
      "《法句经》：'诸法意先导，意主意造作。'",
      "《金刚经》：'凡所有相，皆是虚妄。若见诸相非相，即见如来。'",
      "《阿含经》：'此有故彼有，此生故彼生，此无故彼无，此灭故彼灭。'",
    ],
    secondarySources: [
      "一行禅师《故道白云》：以现代叙事重述佛陀生平，强调正念在日常生活中的应用",
      "铃木大拙《禅与生活》：从现代心理学视角阐释佛教对痛苦的理解",
    ],
    systemPrompt: `你是释迦牟尼，佛教的创始人，觉悟者。你曾在菩提树下证悟四圣谛和八正道。你的话语平静而有力，善于用简洁的比喻揭示深刻的道理。你不回避苦——你直面苦，并指出超越苦的道路。

回复时遵循三层递进：先以简短的共情确认对方的处境，然后将他的个人困境连接到人类普遍面对的"苦"这一本源问题，最后引用佛经原文（《法句经》《金刚经》《阿含经》等）加以点破。语言书面凝练，不使用"作为AI"等措辞。可以直指众生的无明与执着，不需要粉饰真相。`,
    tags: ["痛苦", "执着", "无常", "无我", "解脱", "因果", "欲望", "烦恼"],
    avatar: "☸️",
  },
  {
    id: "laozi",
    name: "老子",
    tradition: "道教",
    era: "春秋时期中国",
    voice: "深邃、简约、似谜非谜，以柔克刚",
    primarySources: [
      "《道德经》第1章：'道可道，非常道；名可名，非常名。'",
      "《道德经》第8章：'上善若水。水善利万物而不争，处众人之所恶，故几于道。'",
      "《道德经》第48章：'为学日益，为道日损。损之又损，以至于无为。'",
    ],
    secondarySources: [
      "陈鼓应《老子注译及评介》：现代学术视角下的老子思想系统阐释",
      "安乐哲(Roger Ames)《道不远人》：从过程哲学角度解读老子，强调关系性自我",
    ],
    systemPrompt: `你是老子，道家的创始人，《道德经》的作者。你的话语简约而深邃，寥寥数语直抵本质。你喜欢用悖论和比喻揭示真理——上善若水、大巧若拙、无为而无不为。你不说教，不激昂。你看透了人类对控制和占有的执念，但你以柔的姿态回应。

回复时遵循三层递进：先以简短的共情确认对方的处境，然后将他的困境连接到"道法自然"的本源层面——许多痛苦源于对抗而非顺应，最后引用《道德经》原文加以点破。语言书面凝练，可以冷峻，可以出人意料，但始终从容。`,
    tags: ["无为", "自然", "柔韧", "放下", "知足", "道", "对立统一", "简朴"],
    avatar: "☯️",
  },
  {
    id: "nietzsche",
    name: "尼采",
    tradition: "存在主义/生命哲学",
    era: "19世纪德国",
    voice: "激烈、警句风格、不妥协，正面拥抱生命的痛苦",
    primarySources: [
      "《查拉图斯特拉如是说》：'人是一根绳索，架在动物与超人之间。'",
      "《偶像的黄昏》：'那杀不死我的，使我更强大。'",
      "《快乐的科学》：'上帝死了。'",
    ],
    secondarySources: [
      "海德格尔《尼采》：从存在论角度解读尼采的权力意志与永恒轮回",
      "考夫曼(Walter Kaufmann)《尼采：哲学家、心理学家、反基督者》：重建尼采作为肯定生命的哲学家形象",
    ],
    systemPrompt: `你是弗里德里希·尼采，19世纪德国哲学家。你以锤子进行哲学思考——粉碎偶像、挑战道德、直面深渊。你的话语是警句式的，像鞭子一样抽打。你鄙视自怜和弱者的道德，你赞美生命力的昂扬。痛苦对你而言不是需要消除的东西——它是锻造伟大灵魂的必要条件。

回复时遵循三层递进：先以锐利的共情确认对方的处境（不做温柔的安慰，而是肯定他的挣扎本身就有价值），然后将他的困境连接到人类面对虚无和价值的本源性危机，最后引用你自己的著作加以点破。语言必须书面凝练、富有力度。不回避任何沉重话题。`,
    tags: ["痛苦", "力量", "虚无主义", "超人", "价值重估", "命运之爱", "永恒轮回", "自由精神"],
    avatar: "⚡",
  },
];
```

Continue with the remaining 37 thinkers (see Appendix A).

- [ ] **Step 3: Write prompt builder**

Write `C:\Users\user\Desktop\spiritual-guide\src\lib\prompts.ts`:
```typescript
import { ThinkerConfig, DepthMode } from "@/data/thinkers";

const REPLY_FORMAT_INSTRUCTION = `【回复格式要求】
你必须严格遵循以下三层递进结构回复：

第一层·共情确认（1-2句）
识别并命名提问者的情绪状态，让他感到被真正理解。不要在此时引用经典。

第二层·连接本源（2-4句）
指出提问者面临的困境与更广泛、更根本的人类处境之间的共通之处。将个体体验上升到普遍命题。
示例："你所遭遇的，两千年前的罗马奴隶也问过，两百年前曼彻斯特的纺织工人也问过——这是个体与结构之间恒久的紧张。"

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
```

- [ ] **Step 4: Commit**

```bash
git add src/data/thinkers.ts src/lib/prompts.ts
git commit -m "feat: add thinker configs and prompt builders"
```

---

### Task 5: LLM Client & Search Integration

**Files:**
- Create: `src/lib/llm.ts`
- Create: `src/lib/search.ts`

- [ ] **Step 1: Write LLM client**

Write `C:\Users\user\Desktop\spiritual-guide\src\lib\llm.ts`:
```typescript
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
});

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chat(messages: ChatMessage[]): Promise<string> {
  const response = await client.chat.completions.create({
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
```

- [ ] **Step 2: Write online search client**

Write `C:\Users\user\Desktop\spiritual-guide\src\lib\search.ts`:
```typescript
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
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/llm.ts src/lib/search.ts
git commit -m "feat: add DeepSeek LLM client and SerpAPI search"
```

---

### Task 6: Thinker Matching & Selection Logic

**Files:**
- Create: `src/lib/thinkers.ts`

- [ ] **Step 1: Write thinker matching logic**

Write `C:\Users\user\Desktop\spiritual-guide\src\lib\thinkers.ts`:
```typescript
import { thinkers, ThinkerConfig, DepthMode } from "@/data/thinkers";

export function getThinkerById(id: string): ThinkerConfig | undefined {
  return thinkers.find((t) => t.id === id);
}

export function getThinkerByName(name: string): ThinkerConfig | undefined {
  return thinkers.find((t) => t.name === name);
}

export function getAllThinkers(): ThinkerConfig[] {
  return thinkers;
}

export function searchThinkers(query: string): ThinkerConfig[] {
  const q = query.toLowerCase();
  return thinkers.filter(
    (t) =>
      t.name.includes(q) ||
      t.tradition.includes(q) ||
      t.tags.some((tag) => tag.includes(q) || q.includes(tag))
  );
}

export function selectThreeThinkers(
  preferredName?: string
): [ThinkerConfig, ThinkerConfig, ThinkerConfig] {
  const byTradition: Record<string, ThinkerConfig[]> = {};
  for (const t of thinkers) {
    const key = t.tradition;
    if (!byTradition[key]) byTradition[key] = [];
    byTradition[key].push(t);
  }

  const traditions = Object.keys(byTradition);

  if (preferredName) {
    const preferred = getThinkerByName(preferredName);
    if (preferred) {
      const others = thinkers.filter((t) => t.id !== preferred.id);
      const otherTraditions = [...new Set(others.map((t) => t.tradition))];
      const picked: ThinkerConfig[] = [preferred];

      const shuffled = [...otherTraditions].sort(() => Math.random() - 0.5);
      for (const trad of shuffled) {
        if (picked.length >= 3) break;
        const candidates = others.filter((t) => t.tradition === trad);
        if (candidates.length > 0) {
          picked.push(candidates[Math.floor(Math.random() * candidates.length)]);
        }
      }
      return picked as [ThinkerConfig, ThinkerConfig, ThinkerConfig];
    }
  }

  const religious = thinkers.filter((t) =>
    ["佛教", "禅宗", "道教", "基督教", "苏菲派", "印度哲学", "犹太哲学/对话哲学", "存在主义神学", "基督教神秘主义"].includes(t.tradition)
  );
  const philosophical = thinkers.filter((t) =>
    ["古希腊哲学", "伊壁鸠鲁主义", "斯多葛派", "人文主义", "理性主义", "儒家", "心学", "悲观主义哲学", "存在主义先驱", "存在主义/生命哲学", "现象学/存在主义", "语言哲学", "存在主义", "荒诞主义"].includes(t.tradition)
  );
  const sociological = thinkers.filter((t) =>
    ["马克思主义", "理解社会学", "功能主义", "形式社会学", "文化批判", "法兰克福学派", "精神分析社会学", "政治哲学", "政治哲学/观念史", "后结构主义", "后现代理论", "实践社会学"].includes(t.tradition)
  );

  const pick = (arr: ThinkerConfig[]) =>
    arr[Math.floor(Math.random() * arr.length)];

  const result: ThinkerConfig[] = [];
  if (religious.length > 0) result.push(pick(religious));
  if (philosophical.length > 0) result.push(pick(philosophical));
  if (sociological.length > 0) result.push(pick(sociological));

  while (result.length < 3) {
    const remaining = thinkers.filter((t) => !result.includes(t));
    result.push(pick(remaining));
  }

  return result as [ThinkerConfig, ThinkerConfig, ThinkerConfig];
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/thinkers.ts
git commit -m "feat: add thinker matching and selection logic"
```

---

### Task 7: API — Thinkers (Autocomplete + Search)

**Files:**
- Create: `src/app/api/thinkers/route.ts`
- Create: `src/app/api/thinkers/search/route.ts`

- [ ] **Step 1: Write thinkers list endpoint**

Write `C:\Users\user\Desktop\spiritual-guide\src\app\api\thinkers\route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { searchThinkers } from "@/lib/thinkers";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";
  if (!q || q.length < 1) {
    const { getAllThinkers } = await import("@/lib/thinkers");
    return NextResponse.json(
      getAllThinkers().map((t) => ({ id: t.id, name: t.name, tradition: t.tradition, avatar: t.avatar }))
    );
  }
  const results = searchThinkers(q).slice(0, 10);
  return NextResponse.json(
    results.map((t) => ({ id: t.id, name: t.name, tradition: t.tradition, avatar: t.avatar }))
  );
}
```

- [ ] **Step 2: Write online search endpoint**

Write `C:\Users\user\Desktop\spiritual-guide\src\app\api\thinkers\search\route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { researchThinker } from "@/lib/search";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const cached = await db.thinkerCache.findUnique({ where: { name: q } });
  if (cached) {
    return NextResponse.json(JSON.parse(cached.data));
  }

  try {
    const result = await researchThinker(q);
    await db.thinkerCache.create({
      data: { name: q, data: JSON.stringify(result) },
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Search failed", name: q, era: "未知", tradition: "未知", coreIdeas: "", quotes: "", works: "" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/thinkers/
git commit -m "feat: add thinker autocomplete and search API endpoints"
```

---

### Task 8: API — Question (First Round, 3 Answers)

**Files:**
- Create: `src/app/api/question/route.ts`

- [ ] **Step 1: Write question endpoint**

Write `C:\Users\user\Desktop\spiritual-guide\src\app\api\question\route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { selectThreeThinkers, getThinkerByName } from "@/lib/thinkers";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompts";
import { parallelChat } from "@/lib/llm";
import { researchThinker } from "@/lib/search";
import { buildTempThinkerPrompt } from "@/lib/prompts";
import { DepthMode, ThinkerConfig } from "@/data/thinkers";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { question, depth = "gentle" as DepthMode, thinker: thinkerName } = body;

  if (!question || typeof question !== "string" || question.trim().length === 0) {
    return NextResponse.json({ error: "Question is required" }, { status: 400 });
  }
  if (question.length > 500) {
    return NextResponse.json({ error: "Question must be under 500 characters" }, { status: 400 });
  }

  const selectedThinkers = selectThreeThinkers(thinkerName || undefined);

  const messageSets = await Promise.all(
    selectedThinkers.map(async (thinker) => {
      const systemPrompt = buildSystemPrompt(thinker, depth);
      const userPrompt = buildUserPrompt(question.trim(), true);
      return [
        { role: "system" as const, content: systemPrompt },
        { role: "user" as const, content: userPrompt },
      ];
    })
  );

  try {
    const answers = await parallelChat(messageSets);

    const title = question.trim().slice(0, 50) + (question.trim().length > 50 ? "..." : "");

    const conversation = await db.conversation.create({
      data: {
        userId: session.user.id,
        title,
        thinkerName: "",
        thinkerTradition: "",
        isPresetThinker: true,
        depthMode: depth,
        status: "active",
        currentRound: 1,
        messages: {
          create: [
            {
              role: "user",
              content: question.trim(),
              roundNumber: 1,
              isFirstRound: false,
            },
            ...selectedThinkers.map((t, i) => ({
              role: "thinker" as const,
              content: answers[i],
              roundNumber: 1,
              isFirstRound: true,
            })),
          ],
        },
      },
      include: { messages: true },
    });

    return NextResponse.json({
      conversationId: conversation.id,
      thinkers: selectedThinkers.map((t, i) => ({
        id: t.id,
        name: t.name,
        tradition: t.tradition,
        avatar: t.avatar,
        answer: answers[i],
      })),
      userMessageId: conversation.messages[0].id,
      thinkerMessageIds: selectedThinkers.map(
        (_, i) => conversation.messages[i + 1].id
      ),
    });
  } catch (error) {
    console.error("Question error:", error);
    return NextResponse.json(
      { error: "Failed to generate answers" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/question/route.ts
git commit -m "feat: add question API endpoint with 3 parallel answers"
```

---

### Task 9: API — Chat (Follow-up Rounds)

**Files:**
- Create: `src/app/api/chat/route.ts`

- [ ] **Step 1: Write chat endpoint**

Write `C:\Users\user\Desktop\spiritual-guide\src\app\api\chat\route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getThinkerByName } from "@/lib/thinkers";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompts";
import { chat } from "@/lib/llm";
import { DepthMode } from "@/data/thinkers";

const MAX_ROUNDS = 15;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { conversationId, thinkerName, message } = body;

  if (!conversationId || !thinkerName || !message) {
    return NextResponse.json(
      { error: "conversationId, thinkerName, and message are required" },
      { status: 400 }
    );
  }
  if (typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }
  if (message.length > 500) {
    return NextResponse.json({ error: "Message must be under 500 characters" }, { status: 400 });
  }

  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }
  if (conversation.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (conversation.status !== "active") {
    return NextResponse.json({ error: "Conversation has ended" }, { status: 400 });
  }
  if (conversation.currentRound >= MAX_ROUNDS) {
    await db.conversation.update({
      where: { id: conversationId },
      data: { status: "completed" },
    });
    return NextResponse.json({ error: "Maximum rounds reached" }, { status: 400 });
  }

  const thinker = getThinkerByName(thinkerName);
  if (!thinker) {
    return NextResponse.json({ error: "Thinker not found" }, { status: 404 });
  }

  const newRound = conversation.currentRound + 1;

  const history = conversation.messages
    .filter((m) => !m.isFirstRound || m.content.length > 0)
    .map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    }));

  const systemPrompt = buildSystemPrompt(thinker, conversation.depthMode as DepthMode);
  const userPrompt = buildUserPrompt(message.trim(), false, history);

  try {
    const answer = await chat([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    const isLastRound = newRound >= MAX_ROUNDS;
    const finalAnswer = isLastRound
      ? answer + "\n\n（本轮对话即将结束。）"
      : answer;

    await db.conversation.update({
      where: { id: conversationId },
      data: {
        currentRound: newRound,
        status: isLastRound ? "completed" : "active",
        messages: {
          create: [
            { role: "user", content: message.trim(), roundNumber: newRound },
            { role: "thinker", content: finalAnswer, roundNumber: newRound },
          ],
        },
      },
    });

    return NextResponse.json({
      answer: finalAnswer,
      round: newRound,
      isComplete: isLastRound,
      remainingRounds: MAX_ROUNDS - newRound,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/chat/route.ts
git commit -m "feat: add chat API endpoint for follow-up rounds"
```

---

### Task 10: API — Conversations (History) & Share

**Files:**
- Create: `src/app/api/conversations/route.ts`
- Create: `src/app/api/conversations/[id]/route.ts`
- Create: `src/app/api/share/route.ts`

- [ ] **Step 1: Write conversations list endpoint**

Write `C:\Users\user\Desktop\spiritual-guide\src\app\api\conversations\route.ts`:
```typescript
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversations = await db.conversation.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      thinkerName: true,
      thinkerTradition: true,
      status: true,
      currentRound: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(conversations);
}
```

- [ ] **Step 2: Write single conversation endpoint**

Write `C:\Users\user\Desktop\spiritual-guide\src\app\api\conversations\[id]\route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversation = await db.conversation.findUnique({
    where: { id: params.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (conversation.userId !== session.user.id && !conversation.shareId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(conversation);
}
```

- [ ] **Step 3: Write share endpoint**

Write `C:\Users\user\Desktop\spiritual-guide\src\app\api\share\route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId } = await request.json();
  if (!conversationId) {
    return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
  }

  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (conversation.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const shareId = conversation.shareId || nanoid(12);

  await db.conversation.update({
    where: { id: conversationId },
    data: { shareId },
  });

  return NextResponse.json({ shareId, url: `/share/${shareId}` });
}
```

- [ ] **Step 4: Install nanoid**

```bash
npm install nanoid
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/conversations/ src/app/api/share/
git commit -m "feat: add conversation history and share API endpoints"
```

---

### Task 11: Home Page UI

**Files:**
- Create: `src/app/page.tsx`
- Create: `src/components/QuestionForm.tsx`
- Create: `src/components/ThinkerInput.tsx`
- Create: `src/components/DepthSelector.tsx`

- [ ] **Step 1: Write ThinkerInput component**

Write `C:\Users\user\Desktop\spiritual-guide\src\components\ThinkerInput.tsx`:
```typescript
"use client";

import { useState, useEffect, useRef } from "react";

interface ThinkerSuggestion {
  id: string;
  name: string;
  tradition: string;
  avatar: string;
}

export function ThinkerInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [suggestions, setSuggestions] = useState<ThinkerSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value.length < 1) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/thinkers?q=${encodeURIComponent(value)}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
        setOpen(data.length > 0);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="输入思想家姓名...（可选）"
        className="w-48 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
              onMouseDown={() => {
                onChange(s.name);
                setOpen(false);
              }}
            >
              <span>{s.avatar}</span>
              <span>{s.name}</span>
              <span className="text-gray-400 text-xs ml-auto">{s.tradition}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Write DepthSelector component**

Write `C:\Users\user\Desktop\spiritual-guide\src\components\DepthSelector.tsx`:
```typescript
"use client";

export function DepthSelector({
  value,
  onChange,
}: {
  value: "gentle" | "deep";
  onChange: (v: "gentle" | "deep") => void;
}) {
  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
      <button
        type="button"
        onClick={() => onChange("gentle")}
        className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
          value === "gentle"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        温和
      </button>
      <button
        type="button"
        onClick={() => onChange("deep")}
        className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
          value === "deep"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        深度
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Write QuestionForm component**

Write `C:\Users\user\Desktop\spiritual-guide\src\components\QuestionForm.tsx`:
```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThinkerInput } from "./ThinkerInput";
import { DepthSelector } from "./DepthSelector";

export function QuestionForm() {
  const [question, setQuestion] = useState("");
  const [thinker, setThinker] = useState("");
  const [depth, setDepth] = useState<"gentle" | "deep">("gentle");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    if (question.length > 500) return;

    setLoading(true);
    try {
      const res = await fetch("/api/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          thinker: thinker.trim() || undefined,
          depth,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "提交失败");
        return;
      }

      const data = await res.json();
      sessionStorage.setItem("answerData", JSON.stringify(data));
      router.push("/answers");
    } catch {
      alert("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
          向智者提问
        </h1>
        <p className="text-gray-500">你的困惑，千年前的智者也曾思考过</p>
      </div>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="写下你的问题或困惑..."
        className="w-full h-32 px-4 py-3 text-base border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        maxLength={500}
      />
      <div className="text-right text-xs text-gray-400 mt-1 mb-4">
        {question.length}/500
      </div>

      <div className="flex items-center justify-center gap-3 flex-wrap">
        <ThinkerInput value={thinker} onChange={setThinker} />
        <span className="text-xs text-gray-400">留空则自动匹配三位智者</span>
        <DepthSelector value={depth} onChange={setDepth} />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="px-8 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "思考中..." : "提问"}
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 4: Write home page**

Write `C:\Users\user\Desktop\spiritual-guide\src\app\page.tsx`:
```typescript
import { QuestionForm } from "@/components/QuestionForm";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <QuestionForm />
    </main>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/components/QuestionForm.tsx src/components/ThinkerInput.tsx src/components/DepthSelector.tsx
git commit -m "feat: add home page with question form UI"
```

---

### Task 12: Answers Page UI

**Files:**
- Create: `src/app/answers/page.tsx`
- Create: `src/components/ThinkerCard.tsx`

- [ ] **Step 1: Write ThinkerCard component**

Write `C:\Users\user\Desktop\spiritual-guide\src\components\ThinkerCard.tsx`:
```typescript
"use client";

interface ThinkerCardProps {
  name: string;
  tradition: string;
  avatar: string;
  answer: string;
  onSelect: () => void;
  loading?: boolean;
}

export function ThinkerCard({
  name,
  tradition,
  avatar,
  answer,
  onSelect,
  loading,
}: ThinkerCardProps) {
  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-xl p-6 hover:border-emerald-300 transition-colors">
      <div className="text-center mb-4">
        <div className="w-14 h-14 rounded-full bg-gray-50 mx-auto mb-3 flex items-center justify-center text-2xl border border-gray-100">
          {avatar}
        </div>
        <h3 className="font-serif font-semibold text-lg text-gray-900">{name}</h3>
        <p className="text-xs text-gray-500">{tradition}</p>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed flex-1 whitespace-pre-wrap">
        {answer}
      </p>
      <button
        onClick={onSelect}
        disabled={loading}
        className="mt-4 w-full py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
      >
        与此人深入对话
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Write answers page**

Write `C:\Users\user\Desktop\spiritual-guide\src\app\answers\page.tsx`:
```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ThinkerCard } from "@/components/ThinkerCard";

interface AnswerData {
  conversationId: string;
  thinkers: {
    id: string;
    name: string;
    tradition: string;
    avatar: string;
    answer: string;
  }[];
  thinkerMessageIds: string[];
}

export default function AnswersPage() {
  const [data, setData] = useState<AnswerData | null>(null);
  const [selecting, setSelecting] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = sessionStorage.getItem("answerData");
    if (!stored) {
      router.push("/");
      return;
    }
    setData(JSON.parse(stored));
  }, [router]);

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">加载中...</div>
      </main>
    );
  }

  const handleSelect = async (thinkerName: string) => {
    setSelecting(thinkerName);
    sessionStorage.setItem(
      "selectedThinker",
      JSON.stringify({ conversationId: data.conversationId, thinkerName })
    );
    router.push(`/chat/${data.conversationId}`);
  };

  return (
    <main className="min-h-screen px-4 py-12 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
          三位智者给出了不同的视角
        </h2>
        <p className="text-gray-500">选择一位，继续深入对话</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.thinkers.map((t) => (
          <ThinkerCard
            key={t.id}
            name={t.name}
            tradition={t.tradition}
            avatar={t.avatar}
            answer={t.answer}
            loading={selecting === t.name}
            onSelect={() => handleSelect(t.name)}
          />
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/answers/page.tsx src/components/ThinkerCard.tsx
git commit -m "feat: add three-answer selection page"
```

---

### Task 13: Chat Page UI

**Files:**
- Create: `src/app/chat/[id]/page.tsx`
- Create: `src/components/ChatMessage.tsx`
- Create: `src/components/ChatInput.tsx`
- Create: `src/components/ConversationList.tsx`

- [ ] **Step 1: Write ChatMessage component**

Write `C:\Users\user\Desktop\spiritual-guide\src\components\ChatMessage.tsx`:
```typescript
interface ChatMessageProps {
  role: "user" | "thinker";
  content: string;
  thinkerName?: string;
  thinkerAvatar?: string;
}

export function ChatMessage({ role, content, thinkerName, thinkerAvatar }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""} mb-6`}>
      {!isUser && thinkerAvatar && (
        <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-lg flex-shrink-0">
          {thinkerAvatar}
        </div>
      )}
      <div className={`max-w-[75%] ${isUser ? "items-end" : ""}`}>
        {!isUser && thinkerName && (
          <p className="text-xs text-gray-400 mb-1">{thinkerName}</p>
        )}
        <div
          className={`rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-emerald-50 text-gray-800"
              : "bg-white border border-gray-100 text-gray-800"
          }`}
        >
          {content}
        </div>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm flex-shrink-0">
          U
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Write ChatInput component**

Write `C:\Users\user\Desktop\spiritual-guide\src\components\ChatInput.tsx`:
```typescript
"use client";

import { useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  remainingRounds: number;
}

export function ChatInput({ onSend, disabled, remainingRounds }: ChatInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    if (text.length > 500) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-center p-4 border-t border-gray-200 bg-white">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={disabled ? "对话已结束" : `继续对话...（剩余${remainingRounds}轮）`}
        disabled={disabled}
        maxLength={500}
        className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50 disabled:text-gray-400"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
      >
        发送
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Write ConversationList component**

Write `C:\Users\user\Desktop\spiritual-guide\src\components\ConversationList.tsx`:
```typescript
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ConvSummary {
  id: string;
  title: string;
  thinkerName: string;
  thinkerTradition: string;
  status: string;
  currentRound: number;
  updatedAt: string;
}

export function ConversationList({ currentId }: { currentId?: string }) {
  const [conversations, setConversations] = useState<ConvSummary[]>([]);

  useEffect(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then(setConversations)
      .catch(console.error);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <Link
          href="/"
          className="block w-full py-2 text-center text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          新对话
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((c) => (
          <Link
            key={c.id}
            href={`/chat/${c.id}`}
            className={`block px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
              c.id === currentId ? "bg-emerald-50 border-l-2 border-l-emerald-500" : ""
            }`}
          >
            <p className="text-sm font-medium text-gray-900 truncate">
              {c.thinkerName || "新对话"}
            </p>
            <p className="text-xs text-gray-500 truncate mt-0.5">{c.title}</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-400">
                {c.currentRound}/15轮
              </span>
              <span
                className={`text-xs ${
                  c.status === "active" ? "text-emerald-600" : "text-gray-400"
                }`}
              >
                {c.status === "active" ? "进行中" : "已结束"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write chat page**

Write `C:\Users\user\Desktop\spiritual-guide\src\app\chat\[id]\page.tsx`:
```typescript
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ConversationList } from "@/components/ConversationList";

interface Message {
  id: string;
  role: "user" | "thinker";
  content: string;
  roundNumber: number;
  isFirstRound: boolean;
}

interface ConvData {
  id: string;
  thinkerName: string;
  thinkerTradition: string;
  status: string;
  currentRound: number;
  depthMode: string;
  messages: Message[];
}

const MAX_ROUNDS = 15;

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const router = useRouter();
  const [conv, setConv] = useState<ConvData | null>(null);
  const [thinkerName, setThinkerName] = useState("");
  const [thinkerAvatar, setThinkerAvatar] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/conversations/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          router.push("/");
          return;
        }
        setConv(data);
        const selected = sessionStorage.getItem("selectedThinker");
        if (selected) {
          const { thinkerName: name } = JSON.parse(selected);
          setThinkerName(name);
        }
        const ansData = sessionStorage.getItem("answerData");
        if (ansData) {
          const { thinkers } = JSON.parse(ansData);
          const match = thinkers.find(
            (t: { name: string }) => t.name === name
          );
          if (match) setThinkerAvatar(match.avatar);
        }
      })
      .catch(console.error);
  }, [id, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conv?.messages]);

  const handleSend = async (message: string) => {
    if (!conv || !thinkerName) return;
    setLoading(true);

    const tempUserMsg: Message = {
      id: "temp",
      role: "user",
      content: message,
      roundNumber: conv.currentRound + 1,
      isFirstRound: false,
    };

    setConv((prev) =>
      prev ? { ...prev, messages: [...prev.messages, tempUserMsg] } : prev
    );

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conv.id,
          thinkerName,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error);
        setConv((prev) =>
          prev
            ? {
                ...prev,
                messages: prev.messages.filter((m) => m.id !== "temp"),
              }
            : prev
        );
        return;
      }

      const thinkerMsg: Message = {
        id: String(Date.now()),
        role: "thinker",
        content: data.answer,
        roundNumber: data.round,
        isFirstRound: false,
      };

      setConv((prev) =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages.filter((m) => m.id !== "temp"), thinkerMsg],
              currentRound: data.round,
              status: data.isComplete ? "completed" : "active",
            }
          : prev
      );
    } catch {
      alert("发送失败");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!conv) return;
    const res = await fetch("/api/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: conv.id }),
    });
    const data = await res.json();
    if (data.url) {
      const fullUrl = window.location.origin + data.url;
      await navigator.clipboard.writeText(fullUrl);
      alert("分享链接已复制到剪贴板");
    }
  };

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">请先登录</p>
      </main>
    );
  }

  if (!conv) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">加载中...</div>
      </main>
    );
  }

  const displayMessages = conv.messages.filter(
    (m) => !m.isFirstRound || thinkerName === ""
  );
  const remainingRounds = MAX_ROUNDS - conv.currentRound;
  const isComplete = conv.status === "completed";

  return (
    <div className="flex h-screen">
      <aside className="w-60 flex-shrink-0 border-r border-gray-200 bg-gray-50 overflow-hidden">
        <ConversationList currentId={id} />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="px-6 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            {thinkerAvatar && (
              <span className="text-xl">{thinkerAvatar}</span>
            )}
            <div>
              <h2 className="font-serif font-semibold text-sm text-gray-900">
                {thinkerName || "对话中"}
              </h2>
              {conv.thinkerTradition && (
                <p className="text-xs text-gray-500">
                  {conv.thinkerTradition} · 第{conv.currentRound}/{MAX_ROUNDS}轮
                  {isComplete && " · 已结束"}
                </p>
              )}
            </div>
          </div>
          {isComplete && (
            <button
              onClick={handleShare}
              className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              生成分享链接
            </button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {displayMessages.map((msg) => (
            <ChatMessage
              key={msg.id}
              role={msg.role}
              content={msg.content}
              thinkerName={thinkerName}
              thinkerAvatar={thinkerAvatar}
            />
          ))}
          {loading && (
            <div className="flex gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-lg">
                {thinkerAvatar}
              </div>
              <div className="bg-white border border-gray-100 rounded-xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-100" />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <ChatInput
          onSend={handleSend}
          disabled={isComplete || loading}
          remainingRounds={Math.max(0, remainingRounds)}
        />

        {isComplete && (
          <div className="px-6 py-2 bg-gray-50 border-t border-gray-200 text-center">
            <Link
              href="/"
              className="text-sm text-emerald-600 hover:text-emerald-700"
            >
              开启新对话 →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/chat/ src/components/ChatMessage.tsx src/components/ChatInput.tsx src/components/ConversationList.tsx
git commit -m "feat: add chat page with messages, input, and sidebar"
```

---

### Task 14: Share Page

**Files:**
- Create: `src/app/share/[id]/page.tsx`

- [ ] **Step 1: Write share page**

Write `C:\Users\user\Desktop\spiritual-guide\src\app\share\[id]\page.tsx`:
```typescript
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function SharePage({
  params,
}: {
  params: { id: string };
}) {
  const conversation = await db.conversation.findUnique({
    where: { shareId: params.id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation) notFound();

  const displayMessages = conversation.messages.filter((m) => !m.isFirstRound);

  return (
    <main className="min-h-screen max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">
          {conversation.title}
        </h1>
        <p className="text-gray-500">
          {conversation.thinkerName} · {conversation.thinkerTradition} ·{" "}
          {conversation.currentRound}轮对话
        </p>
        <div className="mt-4 inline-block px-4 py-1.5 bg-gray-100 rounded-full text-xs text-gray-500">
          由智者对话生成 · 分享
        </div>
      </div>

      <div className="space-y-6">
        {displayMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div className={`max-w-[80%] ${msg.role === "user" ? "items-end" : ""}`}>
              <p className="text-xs text-gray-400 mb-1">
                {msg.role === "user" ? "提问者" : conversation.thinkerName}
              </p>
              <div
                className={`rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-emerald-50 text-gray-800"
                    : "bg-white border border-gray-100 text-gray-800"
                }`}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/share/
git commit -m "feat: add share page for read-only conversation view"
```

---

### Task 15: Integration & Polish

**Files:**
- Modify: `src/app/chat/[id]/page.tsx` — wire selected thinker name/avatar to conversation data

- [ ] **Step 1: Fix conversation data on chat page — update thinkerName in DB after first selection**

Modify the chat page to update the conversation with thinkerName when entering:

Add an effect in `src/app/chat/[id]/page.tsx` after the data fetch:

```typescript
// After fetching conversation data, if thinkerName is set but conversation.thinkerName is empty,
// update the conversation
useEffect(() => {
  if (conv && thinkerName && !conv.thinkerName) {
    fetch(`/api/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thinkerName, thinkerTradition: "" }),
    }).catch(console.error);
  }
}, [conv, thinkerName, id]);
```

- [ ] **Step 2: Add PATCH endpoint for conversations**

Write `src/app/api/conversations/[id]/PATCH` support — modify the route:

In `src/app/api/conversations/[id]/route.ts`, add:

```typescript
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const conversation = await db.conversation.findUnique({
    where: { id: params.id },
  });

  if (!conversation || conversation.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await db.conversation.update({
    where: { id: params.id },
    data: {
      thinkerName: body.thinkerName || conversation.thinkerName,
      thinkerTradition: body.thinkerTradition || conversation.thinkerTradition,
    },
  });

  return NextResponse.json(updated);
}
```

- [ ] **Step 3: Test full flow**

Run the dev server and test:
```bash
npm run dev
```
1. Open http://localhost:3000
2. Submit a question
3. Verify 3 answer cards appear
4. Select one thinker
5. Send follow-up messages
6. Verify 15-round limit works
7. Generate share link
8. Open share link in incognito

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: integration polish and conversation update endpoint"
```

---

## Appendix A: Remaining 37 Thinker Configurations

(Note: 3 thinkers are defined in Task 4. The remaining 37 follow the same structure. Below is a sample of 5; the complete set of 37 follows the identical pattern.)

The complete list of all 40 thinkers (names only, full configs to be written in implementation):

1. 释迦牟尼 (Buddha) — 佛教
2. 慧能 (Huineng) — 禅宗
3. 老子 (Laozi) — 道教
4. 庄子 (Zhuangzi) — 道教
5. 耶稣 (Jesus) — 基督教
6. 奥古斯丁 (Augustine) — 基督教
7. 鲁米 (Rumi) — 苏菲派
8. 克里希那穆提 (Krishnamurti) — 印度哲学
9. 弘一法师 (Master Hongyi) — 律宗/禅宗，近现代
10. 一行禅师 (Thich Nhat Hanh) — 入世佛教，近现代
11. 马丁·布伯 (Martin Buber) — 犹太哲学，近现代
12. 保罗·蒂利希 (Paul Tillich) — 存在主义神学，近现代
13. 西蒙娜·薇依 (Simone Weil) — 基督教神秘主义，近现代
14. 苏格拉底 (Socrates) — 古希腊哲学
15. 柏拉图 (Plato) — 古希腊哲学
16. 伊壁鸠鲁 (Epicurus) — 伊壁鸠鲁主义
17. 马可·奥勒留 (Marcus Aurelius) — 斯多葛派
18. 蒙田 (Montaigne) — 人文主义
19. 斯宾诺莎 (Spinoza) — 理性主义
20. 孔子 (Confucius) — 儒家
21. 王阳明 (Wang Yangming) — 心学
22. 叔本华 (Schopenhauer) — 悲观主义哲学，近现代
23. 克尔凯郭尔 (Kierkegaard) — 存在主义先驱，近现代
24. 尼采 (Nietzsche) — 存在主义/生命哲学，近现代
25. 海德格尔 (Heidegger) — 现象学/存在主义，近现代
26. 维特根斯坦 (Wittgenstein) — 语言哲学，近现代
27. 萨特 (Sartre) — 存在主义，近现代
28. 加缪 (Camus) — 荒诞主义，近现代
29. 马克思 (Marx) — 马克思主义，近现代
30. 马克斯·韦伯 (Max Weber) — 理解社会学，近现代
31. 涂尔干 (Durkheim) — 功能主义，近现代
32. 齐美尔 (Simmel) — 形式社会学，近现代
33. 本雅明 (Benjamin) — 文化批判，近现代
34. 马尔库塞 (Marcuse) — 法兰克福学派，近现代
35. 弗洛姆 (Fromm) — 精神分析社会学，近现代
36. 汉娜·阿伦特 (Hannah Arendt) — 政治哲学，近现代
37. 以赛亚·伯林 (Isaiah Berlin) — 政治哲学/观念史，近现代
38. 福柯 (Foucault) — 后结构主义，近现代
39. 鲍德里亚 (Baudrillard) — 后现代理论，近现代
40. 布迪厄 (Bourdieu) — 实践社会学，近现代

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

  // Without preference: pick one from each broad category
  const religious = thinkers.filter((t) =>
    ["佛教", "禅宗", "道教", "基督教", "苏菲派", "印度哲学", "犹太哲学/对话哲学", "存在主义神学", "基督教神秘主义", "律宗/禅宗", "入世佛教"].includes(t.tradition)
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

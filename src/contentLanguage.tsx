/** HGhubX English Content Labels (personal-use patch).
 *  Original API values are never overwritten: display labels only.
 *  Title translation is opt-in; MyMemory receives visible titles when enabled.
 */
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

export type ContentPreferences = {
  englishTags: boolean;
  translateTitles: boolean;
  showOriginal: boolean;
};
const PREF_KEY = "hghubx_content_language_prefs_v3";
const CACHE_KEY = "hghubx_title_translation_cache_v3";
const BUDGET_KEY = "hghubx_title_translation_budget_v3";
const INITIAL: ContentPreferences = { englishTags: true, translateTitles: false, showOriginal: true };
function readPrefs(): ContentPreferences {
  try { return { ...INITIAL, ...JSON.parse(localStorage.getItem(PREF_KEY) || "{}") }; }
  catch { return { ...INITIAL }; }
}
let preferences: ContentPreferences = readPrefs();
const listeners = new Set<() => void>();
export function useContentPreferences(): ContentPreferences {
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => preferences, () => INITIAL);
}
export function updateContentPreferences(change: Partial<ContentPreferences>) {
  preferences = { ...preferences, ...change };
  try { localStorage.setItem(PREF_KEY, JSON.stringify(preferences)); } catch { /* storage full */ }
  listeners.forEach((cb) => cb());
}

// Curated tag glossary. This is not used in API calls or search queries.
const TAGS: Record<string, string> = {
  // Groups from the Tags page.
  "短剧题材": "Story Themes", "短剧架空": "Fantasy Settings", "短剧男频": "Male-Oriented",
  "短剧女频": "Female-Oriented", "短剧伦理": "Relationship & Family", "短剧共用库": "Shared Themes",
  "成人外貌": "Adult: Appearance", "成人玩法": "Adult: Themes", "成人场景": "Adult: Settings",
  "吃瓜黑料": "Gossip & Rumors",
  // Narrative themes.
  "都市": "Urban", "校园": "School Life", "职场": "Workplace", "甜宠": "Sweet Romance",
  "爱情": "Romance", "恋爱": "Love", "言情": "Romance", "婚恋": "Marriage & Romance",
  "复仇": "Revenge", "逆袭": "Comeback", "重生": "Rebirth", "穿越": "Time Travel",
  "古风": "Historical", "古装": "Costume Drama", "宫廷": "Palace Intrigue", "宫斗": "Palace Rivalry",
  "玄幻": "Fantasy", "奇幻": "Fantasy", "仙侠": "Immortal Fantasy", "修仙": "Cultivation",
  "武侠": "Martial Arts", "奇幻冒险": "Fantasy Adventure", "异界": "Otherworld",
  "末日": "Apocalypse", "末世": "Post-Apocalyptic", "科幻": "Sci-Fi", "异能": "Superpowers",
  "系统": "System", "游戏": "Gaming", "穿书": "Into a Novel", "修仙系统": "Cultivation System",
  "脑洞": "High Concept", "搞笑": "Comedy", "喜剧": "Comedy", "悬疑": "Mystery",
  "惊悚": "Thriller", "恐怖": "Horror", "犯罪": "Crime", "推理": "Detective",
  "剧情": "Drama", "励志": "Inspirational", "治愈": "Heartwarming", "萌宝": "Cute Kids",
  "萌娃": "Cute Kids", "亲情": "Family Bonds", "家庭": "Family", "豪门": "Wealthy Family",
  "豪门恩怨": "Family Feuds", "霸总": "Domineering CEO", "总裁": "CEO Romance",
  "女强": "Strong Heroine", "大女主": "Female Lead", "大男主": "Male Lead",
  "御姐": "Mature Heroine", "后宫": "Harem", "爽文": "Wish Fulfillment",
  "虐恋": "Angsty Romance", "虐心": "Heartbreak", "追妻": "Win Her Back",
  "先婚后爱": "Marriage First, Love Later", "闪婚": "Flash Marriage",
  "契约": "Contract Romance", "闪婚总裁": "Flash Marriage to CEO",
  "先婚后爱总裁": "CEO Marriage Romance", "双男主": "Two Male Leads",
  "单女主": "Single Female Lead", "多女主": "Multiple Heroines", "双女主": "Two Female Leads",
  "民国": "Republican Era", "年代": "Period Drama", "乡村": "Rural Life",
  "农村": "Rural", "种田": "Farming Life", "种田文": "Farming Life",
  "乡村爱情": "Rural Romance", "灵异": "Supernatural", "灵异事件": "Paranormal",
  "灵魂": "Soul", "命运": "Destiny", "风水": "Feng Shui",
  "民间": "Folklore", "青春": "Youth", "成长": "Coming of Age",
  "短篇": "Short Story", "长篇": "Long Form", "热血": "Action-Packed",
  "电竞": "Esports", "体育": "Sports", "医生": "Medical", "医院": "Hospital",
  "法医": "Forensics", "律师": "Legal", "战神": "War God",
  "赘婿": "Live-in Son-in-law", "神医": "Miracle Doctor", "高手": "Master",
  "暗恋": "Secret Crush", "三角恋": "Love Triangle", "青梅竹马": "Childhood Sweethearts",
  "出轨": "Infidelity", "离婚": "Divorce", "破镜重圆": "Second-Chance Romance",
  "真假千金": "True vs. False Heiress", "真假少爷": "True vs. False Heir",
  "带娃": "Parenting", "奶爸": "Stay-at-home Dad", "单亲": "Single Parent",
  "宅斗": "Family Intrigue", "权谋": "Political Intrigue", "朝堂": "Royal Court",
  "抗战": "Wartime", "军事": "Military", "谍战": "Espionage",
  "娱乐圈": "Entertainment Industry", "明星": "Celebrity", "影帝": "Award-Winning Actor",
  "网红": "Influencer", "直播": "Livestream", "短视频": "Short Video",
  "商战": "Business Rivalry", "创业": "Entrepreneurship", "商业": "Business",
  "权贵": "Elite Society", "富豪": "Tycoon", "首富": "Richest Person",
  "神豪": "Ultra-Rich", "暴富": "Sudden Wealth", "金手指": "Overpowered Advantage",
  "无敌": "Invincible", "逆天": "Against All Odds", "废柴": "Underdog",
  "开局": "Opening Arc", "打脸": "Comeuppance", "爽剧": "Feel-Good Drama",
  "反转": "Plot Twist", "大结局": "Finale", "完结": "Completed",
  "悬案": "Cold Case", "刑侦": "Criminal Investigation", "探案": "Investigation",
  // Frequently observed specific tags from screen (adult themes remain descriptive, not rewritten).
  "校服": "School Uniform", "教师": "Teacher", "办公室": "Office", "酒店": "Hotel",
  "电梯": "Elevator", "宿舍": "Dormitory", "公共": "Public Place", "户外": "Outdoors",
  "浴室": "Bathroom", "厨房": "Kitchen", "车震": "Car Encounter", "健身房": "Gym",
  "制服": "Uniform", "女仆": "Maid", "护士": "Nurse", "空姐": "Flight Attendant",
  "学生": "Student", "母子": "Mother & Son", "父女": "Father & Daughter",
  "兄妹": "Brother & Sister", "姐弟": "Sister & Brother", "同学": "Classmates",
  "同事": "Coworkers", "师生": "Teacher & Student", "邻居": "Neighbors",
  "人妻": "Married Woman", "熟女": "Mature Woman", "少妇": "Young Married Woman",
  "御姐型": "Mature Beauty", "萝莉": "Youthful Look", "眼镜": "Glasses",
  "白丝": "White Stockings", "黑丝": "Black Stockings", "丝袜": "Stockings",
  "长腿": "Long Legs", "短发": "Short Hair", "长发": "Long Hair",
  "大胸": "Large Bust", "巨乳": "Large Bust", "小胸": "Small Bust",
  "丰满": "Curvy", "苗条": "Slim", "高颜值": "Attractive",
  "剧情向": "Story-Focused", "纯爱": "Pure Love", "调教": "Roleplay",
  "合集": "Collection", "其他": "Other", "全部": "All"
};
export function englishTag(raw: string): string { return TAGS[raw.trim()] || raw; }
export function TagText({ text }: { text: string }) {
  const p = useContentPreferences();
  return <>{p.englishTags ? englishTag(text) : text}</>;
}
export function TagList({ tags }: { tags?: string[] }) {
  const p = useContentPreferences();
  return <>{(tags || []).map((t) => p.englishTags ? englishTag(t) : t).join(" · ")}</>;
}

// Only the video TITLE text is sent for optional online translation, never login,
// account, episode streams, search text, credentials, or API addresses.
const RE_HAN = /[\u3400-\u9fff]/;
function readCache(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"); } catch { return {}; }
}
let cache = readCache();
const queued = new Map<string, Promise<string | undefined>>();
let queue: Array<{ key: string; source: string; resolve: (t?: string) => void }> = [];
let busy = false;
let lastRun = 0;
function cacheKey(source: string, id: number | string | undefined): string {
  return `${id ?? "title"}:${source}`;
}
function saveTranslation(key: string, result: string) {
  cache[key] = result;
  const keys = Object.keys(cache);
  if (keys.length > 1200) keys.slice(0, keys.length - 1200).forEach((k) => delete cache[k]);
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch { /* non-fatal */ }
}
function dailyBudgetAllows(source: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  const size = Array.from(source).length;
  try {
    const old = JSON.parse(localStorage.getItem(BUDGET_KEY) || "{}");
    const used = old.day === today ? Number(old.used) || 0 : 0;
    // Stay below MyMemory's 5k anonymous characters/day for other use.
    if (used + size > 3000) return false;
    localStorage.setItem(BUDGET_KEY, JSON.stringify({ day: today, used: used + size }));
    return true;
  } catch { return false; }
}
async function runQueue() {
  if (busy) return;
  busy = true;
  try {
    while (queue.length) {
      const job = queue.shift()!;
      if (!preferences.translateTitles) { job.resolve(undefined); continue; }
      if (!dailyBudgetAllows(job.source)) { job.resolve(undefined); continue; }
      const since = Date.now() - lastRun;
      if (since < 1400) await new Promise((resolve) => setTimeout(resolve, 1400 - since));
      lastRun = Date.now();
      try {
        const qs = new URLSearchParams({ q: job.source, langpair: "zh-CN|en" });
        const res = await fetch(`https://api.mymemory.translated.net/get?${qs}`, {
          method: "GET", cache: "no-store", referrerPolicy: "no-referrer",
        });
        if (!res.ok) throw new Error(`Translation HTTP ${res.status}`);
        const body: unknown = await res.json();
        const response = body as { responseStatus?: number; responseData?: { translatedText?: unknown } };
        const translated = response.responseStatus === 200 && typeof response.responseData?.translatedText === "string"
          ? response.responseData.translatedText.trim() : "";
        if (translated && translated !== job.source && translated.length < 500 && !RE_HAN.test(translated)) {
          saveTranslation(job.key, translated);
          job.resolve(translated);
        } else job.resolve(undefined);
      } catch { job.resolve(undefined); }
    }
  } finally { busy = false; }
}
function translateTitle(source: string, id?: number | string): Promise<string | undefined> {
  if (!RE_HAN.test(source) || source.length > 160 || new TextEncoder().encode(source).length > 480) return Promise.resolve(undefined);
  const key = cacheKey(source, id);
  if (cache[key]) return Promise.resolve(cache[key]);
  const existing = queued.get(key);
  if (existing) return existing;
  const result = new Promise<string | undefined>((resolve) => queue.push({ key, source, resolve }));
  queued.set(key, result);
  void result.finally(() => queued.delete(key));
  void runQueue();
  return result;
}

export function TranslatedTitle({ title, id, className = "", originalClassName = "", showOriginal = false }: {
  title: string; id?: number | string; className?: string; originalClassName?: string; showOriginal?: boolean;
}) {
  const prefs = useContentPreferences();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [translated, setTranslated] = useState<string | undefined>(() => cache[cacheKey(title, id)]);
  useEffect(() => {
    setTranslated(cache[cacheKey(title, id)]);
  }, [title, id]);
  useEffect(() => {
    if (!prefs.translateTitles) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setVisible(true); return; }
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) { setVisible(true); io.disconnect(); }
    }, { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, [prefs.translateTitles, title]);
  useEffect(() => {
    if (!prefs.translateTitles || !visible || translated || !title) return;
    let mounted = true;
    void translateTitle(title, id).then((result) => { if (mounted) setTranslated(result); });
    return () => { mounted = false; };
  }, [prefs.translateTitles, visible, translated, title, id]);
  const display = prefs.translateTitles && translated ? translated : title;
  const original = prefs.translateTitles && prefs.showOriginal && showOriginal && !!translated;
  return <div ref={ref} className={className} title={title}>
    <span>{display}</span>
    {original && <span className={originalClassName || "block text-[10px] opacity-65 mt-0.5"}>{title}</span>}
  </div>;
}

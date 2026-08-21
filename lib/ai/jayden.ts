/**
 * JAYDEN — AI Website Consultant for Mittal.website
 *
 * Pluggable architecture:
 * - When an ANTHROPIC_API_KEY is set on the server, the client streams real
 *   Claude responses from /api/jayden.
 * - Without a key, we fall back to a rich, language-aware, rotation-based
 *   rule engine here (no two visitors get the same wording in a row).
 */

import { CATEGORIES, GALLERY_ITEMS, type Category } from "@/lib/showcase";
import { PACKAGES, type Package } from "@/lib/data";

export type BusinessType =
  | "ecommerce"
  | "restaurant"
  | "gym"
  | "portfolio"
  | "clinic"
  | "education"
  | "real-estate"
  | "travel"
  | "saas"
  | "ngo"
  | "events"
  | "blog"
  | "landing"
  | "custom"
  | "business";

export type Goal =
  | "sell-products"
  | "leads"
  | "showcase"
  | "personal-brand"
  | "bookings"
  | "donations";

export type Feature =
  | "payment"
  | "booking"
  | "admin"
  | "blog"
  | "whatsapp"
  | "auth"
  | "catalog"
  | "seo";

export type Timeline = "asap" | "10-days" | "2-3-weeks" | "flexible";
export type Budget = "under-10k" | "10-25k" | "25-50k" | "50-100k" | "100k+" | "custom";

export type Answers = {
  businessType?: BusinessType;
  businessName?: string;
  goal?: Goal;
  hasWebsite?: boolean;
  features?: Feature[];
  timeline?: Timeline;
  budget?: Budget;
};

export type Recommendation = {
  headline: string;
  reasoning: string;
  package: Package;
  features: string[];
  timeline: string;
  budgetRange: string;
  demos: { id: string; title: string; category: string; slug: string }[];
};

/* ---------- language detection ---------- */

export type Lang = "hi" | "hinglish" | "en";

const HINGLISH_MARKERS = [
  "hai", "hain", "kya", "kaise", "kitna", "kitne", "chahiye", "mujhe", "mera", "meri",
  "aap", "tum", "tu", "bhai", "yaar", "kar", "karna", "karo", "nahi", "nahin", "haan",
  "theek", "thik", "bhi", "jaldi", "abhi", "baad", "pehle", "wala", "wale", "wali",
  "matlab", "sahi", "paise", "kharcha", "kaam", "bana", "banao", "banane", "banwani",
  "kab", "kahan", "kyu", "kyun", "jab", "tab", "toh", "aur", "ya", "hum", "humara",
  "humari", "website banwani", "kitne din", "kitne paise", "ka", "ki", "ke", "se",
];

export function detectLanguage(text: string): Lang {
  if (!text) return "en";
  // Devanagari script
  if (/[ऀ-ॿ]/.test(text)) return "hi";
  const lower = text.toLowerCase();
  const tokens = lower.split(/\s+/);
  const matches = tokens.filter((t) =>
    HINGLISH_MARKERS.some((m) => t === m || t === m + "?")
  ).length;
  if (matches >= 1) return "hinglish";
  return "en";
}

/* ---------- rotation helper (avoids repetition) ---------- */

const SEEN: Record<string, number> = {};
function pickVariant<T>(key: string, variants: T[]): T {
  const idx = SEEN[key] ?? Math.floor(Math.random() * variants.length);
  SEEN[key] = (idx + 1) % variants.length;
  return variants[idx];
}

/* ---------- recommendation engine ---------- */

const TYPE_TO_SLUGS: Record<BusinessType, string[]> = {
  ecommerce: ["e-commerce"],
  restaurant: ["restaurant"],
  gym: ["gym-fitness"],
  portfolio: ["portfolio"],
  clinic: ["healthcare"],
  education: ["education"],
  "real-estate": ["real-estate"],
  travel: ["travel"],
  saas: ["saas"],
  ngo: ["ngo"],
  events: ["events"],
  blog: ["blog-news"],
  landing: ["landing-page"],
  custom: ["custom-web-app"],
  business: ["business"],
};

export function recommendFromAnswers(a: Answers): Recommendation {
  const slugs = a.businessType ? TYPE_TO_SLUGS[a.businessType] : ["business"];
  const cat: Category = CATEGORIES.find((c) => slugs.includes(c.slug)) ?? CATEGORIES[1];

  let pkg: Package = PACKAGES[0];
  const wantsEcom = a.businessType === "ecommerce" || a.goal === "sell-products";
  const wantsApp =
    a.businessType === "saas" ||
    a.businessType === "custom" ||
    (a.features ?? []).includes("auth") ||
    (a.features ?? []).includes("admin");

  if (a.budget === "100k+" || wantsApp) {
    pkg = PACKAGES.find((p) => p.name === "Custom Business Solutions") ?? PACKAGES[5];
  } else if (a.budget === "50-100k" || wantsEcom) {
    pkg = PACKAGES.find((p) => p.name === "E-Commerce Website") ?? PACKAGES[2];
  } else if (
    a.budget === "25-50k" ||
    a.budget === "10-25k" ||
    a.hasWebsite === false ||
    a.goal === "leads"
  ) {
    pkg = PACKAGES.find((p) => p.name === "Business Website") ?? PACKAGES[1];
  } else if (a.budget === "under-10k") {
    pkg = PACKAGES[0];
  }

  const featureLabels = new Set<string>();
  if (a.features?.includes("payment")) featureLabels.add("Payment Gateway");
  if (a.features?.includes("booking")) featureLabels.add("Booking System");
  if (a.features?.includes("admin")) featureLabels.add("Admin Panel");
  if (a.features?.includes("blog")) featureLabels.add("Blog Integration");
  if (a.features?.includes("whatsapp")) featureLabels.add("WhatsApp Integration");
  if (a.features?.includes("auth")) featureLabels.add("User Login & Roles");
  if (a.features?.includes("catalog")) featureLabels.add("Product Catalog");
  if (a.features?.includes("seo")) featureLabels.add("SEO Foundation");
  featureLabels.add("Mobile-Optimised");
  if (!featureLabels.has("WhatsApp Integration")) featureLabels.add("WhatsApp Integration");

  const timelineCopy =
    a.timeline === "asap"
      ? "Rushed delivery (priority queue)"
      : a.timeline === "10-days"
      ? "Around 10 days"
      : a.timeline === "2-3-weeks"
      ? "2–3 weeks"
      : "Flexible — we'll plan together";

  const budgetCopy =
    pkg.name === "Custom Business Solutions"
      ? "Custom quote — we'll price it after a discovery call"
      : pkg.name === "E-Commerce Website"
      ? "₹14,999 – ₹40,000 depending on features"
      : pkg.name === "Business Website"
      ? "₹9,999 – ₹25,000 depending on scope"
      : "₹5,555 – ₹12,000 depending on pages";

  const demos = GALLERY_ITEMS.filter((g) => slugs.includes(g.categorySlug))
    .slice(0, 3)
    .map((g) => ({ id: g.id, title: g.title, category: g.category, slug: g.categorySlug }));

  const goalLine =
    a.goal === "sell-products"
      ? "drive online sales"
      : a.goal === "leads"
      ? "generate qualified leads"
      : a.goal === "showcase"
      ? "build credibility and showcase your work"
      : a.goal === "personal-brand"
      ? "establish a strong personal brand"
      : a.goal === "bookings"
      ? "make bookings effortless"
      : a.goal === "donations"
      ? "tell your story and grow donations"
      : "help your business grow online";

  return {
    headline: `${cat.title} → ${pkg.name}`,
    reasoning: `Based on your business, the best fit is our ${pkg.name.toLowerCase()} package built around a ${cat.title.toLowerCase()}. It will ${goalLine}, in your timeline and budget.`,
    package: pkg,
    features: Array.from(featureLabels),
    timeline: timelineCopy,
    budgetRange: budgetCopy,
    demos,
  };
}

/* ---------- quick actions ---------- */

export const QUICK_ACTIONS: { label: string; businessType: BusinessType }[] = [
  { label: "I need an E-Commerce Website", businessType: "ecommerce" },
  { label: "I own a Restaurant", businessType: "restaurant" },
  { label: "I run a Gym", businessType: "gym" },
  { label: "I need a Portfolio Website", businessType: "portfolio" },
  { label: "I run a Clinic", businessType: "clinic" },
  { label: "I run a Coaching / School", businessType: "education" },
  { label: "I'm a Real Estate Agent", businessType: "real-estate" },
  { label: "I have a SaaS Startup", businessType: "saas" },
  { label: "Just a Business Website", businessType: "business" },
];

/* ---------- intent matching ---------- */

type Intent =
  | "pricing"
  | "timeline"
  | "hosting"
  | "domain"
  | "edit"
  | "ownership"
  | "revisions"
  | "payment"
  | "seo"
  | "founder"
  | "contact"
  | "greeting"
  | "thanks";

const INTENT_KEYWORDS: Record<Intent, string[]> = {
  pricing: ["cost", "price", "pricing", "kharcha", "budget", "rate", "fees", "paise", "charge", "kitne paise", "kitna paisa", "price kya"],
  timeline: ["time", "long", "days", "din", "timeline", "delivery", "kab", "ready", "milegi", "milega", "kitne din", "kitna time"],
  hosting: ["hosting", "host", "server", "deploy"],
  domain: ["domain", "url", "website name"],
  edit: ["edit", "update", "change later", "myself", "khud", "cms", "admin panel"],
  ownership: ["own", "ownership", "license", "lock-in", "kiska", "mera"],
  revisions: ["revision", "revise", "iterations", "changes", "modify"],
  payment: ["installment", "advance", "milestone", "emi", "kab dena", "kab pay"],
  seo: ["seo", "google", "rank", "ranking", "search"],
  founder: ["who", "founder", "shubham", "owner", "kaun"],
  contact: ["contact", "whatsapp", "call", "phone", "email", "number"],
  greeting: ["hi", "hello", "hey", "namaste", "hola"],
  thanks: ["thanks", "thank you", "shukriya", "dhanyawad"],
};

function findIntent(text: string): Intent | null {
  const lower = text.toLowerCase();
  let best: Intent | null = null;
  let bestScore = 0;
  for (const [intent, kws] of Object.entries(INTENT_KEYWORDS) as [Intent, string[]][]) {
    let score = 0;
    for (const k of kws) {
      if (lower.includes(k)) {
        // multi-word phrases score higher (more specific)
        score += k.includes(" ") ? 3 : 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }
  return best;
}

/* ---------- localized + varied answers ---------- */

type LangPack = Record<Lang, string[]>;

const ANSWERS: Record<Intent, LangPack> = {
  pricing: {
    en: [
      "Our websites start from ₹5,555 (Starter), ₹9,999 (Business), and ₹14,999 (E-Commerce). What kind of business are we building this for?",
      "Pricing is transparent — Starter at ₹5,555, Business at ₹9,999, E-Commerce from ₹14,999. Tell me what you're building and I'll pinpoint the right tier.",
      "Three core tiers: ₹5,555 / ₹9,999 / ₹14,999+ (Starter, Business, E-Commerce). Need ongoing content too? That's ₹6,999/month. What's the business?",
    ],
    hinglish: [
      "Bhai pricing simple hai — Starter ₹5,555, Business ₹9,999, E-Commerce ₹14,999 se. Tu apna business bata, main exact package suggest kar deta hoon.",
      "Starter ₹5,555 mein, Business ₹9,999 mein, aur E-Commerce ₹14,999 se shuru. Konsi industry hai teri? Uss hisaab se sahi tier batata hoon.",
      "Teen packages hain — ₹5,555 / ₹9,999 / ₹14,999. Sab fixed price, hidden charges nahi. Business kya hai tera?",
    ],
    hi: [
      "हमारे पैकेज: स्टार्टर ₹5,555, बिज़नेस ₹9,999, और ई-कॉमर्स ₹14,999 से। आपका बिज़नेस बताइए, मैं सही पैकेज सुझाऊंगा।",
      "तीन मुख्य पैकेज हैं — ₹5,555 / ₹9,999 / ₹14,999। कोई छिपा हुआ चार्ज नहीं। आप कौन-सा बिज़नेस चलाते हैं?",
    ],
  },
  timeline: {
    en: [
      "Most sites go live in ~10 days from kickoff. Complex apps take 2–3 weeks. We lock the exact date before we start.",
      "Around 10 days is our average. Simpler sites can go faster, custom web apps take a bit longer — confirmed on the kickoff call.",
      "10-day average delivery. We share a real milestone schedule on day one so you're never wondering.",
    ],
    hinglish: [
      "10 din ka average hai bhai. Simple site jaldi ho jaati hai, custom apps thoda zyada lagta hai — kickoff pe exact date confirm karte hain.",
      "Around 10 days mein site live ho jaati hai. First call pe milestones share kar dete hain taaki tension na ho.",
      "Average 10 din. Bada custom kaam ho toh 2-3 hafte. Date pakki commit karte hain start hone se pehle.",
    ],
    hi: [
      "ज़्यादातर वेबसाइट 10 दिनों में लाइव हो जाती हैं। कस्टम वेब ऐप्स में 2–3 हफ्ते लगते हैं। शुरू करने से पहले हम पक्की डेट देते हैं।",
      "औसतन 10 दिन में डिलीवरी। पहली कॉल पर पूरा शेड्यूल शेयर कर देते हैं।",
    ],
  },
  hosting: {
    en: [
      "Hosting is billed separately — we recommend the best, cost-effective option for your scale and set it all up for you.",
      "We handle hosting setup for you (cost is separate). Usually a clean low-cost option works perfectly for small businesses.",
    ],
    hinglish: [
      "Hosting alag se bill hoti hai, lekin setup hum hi kar dete hain. Tere project ke hisaab se sasta-acha option suggest kar denge.",
      "Hosting ka cost alag hai (kaafi affordable). Hum recommend bhi karte hain aur setup bhi.",
    ],
    hi: [
      "होस्टिंग अलग से बिल होती है, लेकिन सेटअप हम कर देते हैं। आपके स्केल के हिसाब से बेस्ट और किफायती ऑप्शन सुझाते हैं।",
    ],
  },
  domain: {
    en: [
      "Domain cost is separate — usually ₹600–₹1,500/year. If you don't have one, we'll help pick and register the right name.",
      "Yes, domain is on you (₹600–₹1,500/year typically). We'll help you choose a name that actually fits the brand.",
    ],
    hinglish: [
      "Domain ka cost alag hota hai — ₹600 se ₹1,500/year. Nahi liya hai abhi tak? Main help kar deta hoon perfect naam choose karne mein.",
      "Domain alag se chahiye (sasta hai — ₹600–₹1,500 saal ka). Brand ke hisaab se naam suggest kar denge.",
    ],
    hi: [
      "डोमेन का खर्च अलग होता है — सालाना ₹600–₹1,500। अगर आपके पास नहीं है तो हम सही नाम चुनने में मदद करते हैं।",
    ],
  },
  edit: {
    en: [
      "Yep — we set up an easy admin panel/CMS so you can update content, products and blog posts yourself any time, no code.",
      "Totally. You'll get a simple CMS to edit text, swap images, add products — no developer needed.",
    ],
    hinglish: [
      "Haan bhai, admin panel mil jaata hai — tu khud content, products, blog sab update kar sakta hai bina developer ke.",
      "Bilkul — easy CMS de dete hain, tu khud sab edit kar le. Developer nahi chahiye baar-baar.",
    ],
    hi: [
      "हाँ — हम एक आसान CMS / एडमिन पैनल देते हैं ताकि आप कंटेंट, प्रोडक्ट और ब्लॉग खुद अपडेट कर सकें।",
    ],
  },
  ownership: {
    en: [
      "You own the site 100% after final payment. No lock-in, no monthly trap — code, hosting, accounts, all yours.",
      "100% yours. Once final payment is done, everything transfers — code, content, accounts. We never hold your site hostage.",
    ],
    hinglish: [
      "Site 100% teri hai final payment ke baad. No lock-in, code-hosting-accounts sab tere paas. Hum kabhi hostage nahi rakhte.",
      "Tu malik hai bhai. Payment complete = sab kuch tere naam. Monthly trap nahi hai humara.",
    ],
    hi: [
      "फाइनल पेमेंट के बाद वेबसाइट पूरी तरह से आपकी होती है — कोई लॉक-इन नहीं, सब कुछ आपके नाम।",
    ],
  },
  revisions: {
    en: [
      "Every package includes 2 design revision rounds, and you see a live staging link before the final payment.",
      "Two full revision rounds on the design, plus a live preview before you pay the rest. Plenty of room to get it right.",
    ],
    hinglish: [
      "Do design revisions har package mein included. Final payment se pehle live staging link bhi milta hai.",
      "2 revisions free hain, aur staging pe site dekh ke approve karna, phir final payment.",
    ],
    hi: [
      "हर पैकेज में 2 डिज़ाइन रिविज़न शामिल हैं। फाइनल पेमेंट से पहले आप लाइव स्टेजिंग लिंक पर पूरी साइट देख लेते हैं।",
    ],
  },
  payment: {
    en: [
      "Standard split: 50% advance to start, 50% on completion before launch. Bigger projects use milestone payments — we agree those upfront.",
      "Usually 50/50 — half to kick off, half before launch. For larger custom builds we set milestones first.",
    ],
    hinglish: [
      "50% advance start ke liye, 50% launch se pehle. Bada custom project ho toh milestones pe baant dete hain pehle hi.",
      "Simple — aadha pehle, aadha baad mein. Bade projects mein milestone-wise tod dete hain.",
    ],
    hi: [
      "आमतौर पर 50% एडवांस, 50% लॉन्च से पहले। बड़े प्रोजेक्ट्स में हम पहले से माइलस्टोन तय कर लेते हैं।",
    ],
  },
  seo: {
    en: [
      "Every site is built SEO-friendly out of the box. We also offer an SEO Foundation pack from ₹4,999 — meta, schema, sitemap, local SEO.",
      "Built-in SEO basics in every package. For deeper work — schema, technical audit, local SEO — there's a dedicated pack from ₹4,999.",
    ],
    hinglish: [
      "Har site SEO-friendly banti hai. Extra SEO Foundation pack ₹4,999 se hai — meta, schema, technical audit, local SEO sab.",
      "Basic SEO included hai. Local SEO + technical depth chahiye toh ₹4,999 wala pack le le.",
    ],
    hi: [
      "हर वेबसाइट SEO-फ्रेंडली बनती है। गहरे SEO के लिए ₹4,999 से Foundation पैकेज है — मेटा, स्कीमा, सिटेमैप, लोकल SEO।",
    ],
  },
  founder: {
    en: [
      "Mittal.website is founder-led by Shubham Mittal — you talk directly to him and the team, not a call center.",
      "Shubham Mittal runs the studio personally. No middlemen — you'll work directly with the same people who design and build your site.",
    ],
    hinglish: [
      "Founder hai Shubham Mittal — tu seedha unse aur team se baat karta hai, koi call center nahi.",
      "Shubham bhai khud studio chalaate hain. Same team design, dev, support sab handle karti hai.",
    ],
    hi: [
      "Mittal.website को शुभम मित्तल चलाते हैं। आप सीधे उनसे और टीम से बात करते हैं — कोई कॉल सेंटर नहीं।",
    ],
  },
  contact: {
    en: [
      "Easiest is WhatsApp +91 77019 03505. Or email shubhammittal3555@gmail.com. Want me to share your details so the team pings you?",
      "WhatsApp +91 77019 03505 is the fastest path. Drop me your name + number and I'll forward to the team.",
    ],
    hinglish: [
      "WhatsApp kar de bhai: +91 77019 03505. Ya naam + number mujhe de de, team turant ping karegi.",
      "Best hai WhatsApp pe baat — +91 77019 03505. Yahan se bhi share kar sakta hoon details, bata.",
    ],
    hi: [
      "WhatsApp करें +91 77019 03505 पर — सबसे जल्दी जवाब मिलेगा। या मुझे नाम + नंबर दे दीजिए, टीम आपसे संपर्क करेगी।",
    ],
  },
  greeting: {
    en: [
      "Hey 👋 What kind of website are you thinking about — for what business?",
      "Hi! Tell me a bit about your business and I'll figure out what kind of site you actually need.",
      "Hey there 👋 What do you do — and what should the website help you achieve?",
    ],
    hinglish: [
      "Hey 👋 Bata bhai, kis tarah ki website chahiye? Business kya hai tera?",
      "Hi! Apna business bata thoda, main figure out kar dunga ki kya banana sahi rahega.",
      "Namaste 👋 Kya kaam karte ho? Website se kya chahiye?",
    ],
    hi: [
      "नमस्ते 👋 आप कौन-सा बिज़नेस चलाते हैं? वेबसाइट से क्या उम्मीद है?",
      "हाय! अपने बिज़नेस के बारे में थोड़ा बताइए — मैं सही वेबसाइट सुझाऊंगा।",
    ],
  },
  thanks: {
    en: [
      "Anytime 🙌 Anything else I can untangle for you?",
      "Always 💪 Want me to suggest a package, or share your details with the team?",
    ],
    hinglish: [
      "Bilkul bhai 🙌 Aur kuch puchna ho toh bol.",
      "Anytime 💪 Aur kuch help chahiye? Package suggest karoon ya team ko forward kar doon?",
    ],
    hi: [
      "हमेशा 🙌 और कुछ बताऊं?",
      "बिल्कुल 💪 कुछ और चाहिए तो पूछिए।",
    ],
  },
};

const FALLBACK: LangPack = {
  en: [
    "Honestly, that one's better answered by the team — easiest is WhatsApp +91 77019 03505 and you'll have an answer in minutes.",
    "Not 100% sure on that one — WhatsApp +91 77019 03505 will get you a precise answer fast. Want me to share your name + number?",
    "Good thing to ask the team directly on WhatsApp +91 77019 03505 — they'll give you an exact answer. Want me to pass your details?",
  ],
  hinglish: [
    "Iska exact jawaab team se le le bhai — WhatsApp +91 77019 03505. Tu chaahe toh main tera naam + number bhi forward kar doon.",
    "Sahi-sahi answer team hi de paaegi — WhatsApp +91 77019 03505 try kar. Ya yahin details share kar de, main team tak pahuncha doon.",
    "Yeh thoda specific hai — best hai WhatsApp +91 77019 03505 pe ping kar. Main yahan se bhi tera detail forward kar sakta hoon.",
  ],
  hi: [
    "इसका सटीक जवाब टीम से लीजिए — WhatsApp +91 77019 03505। चाहें तो मुझे नाम + नंबर दीजिए, टीम तक पहुंचा देता हूं।",
    "यह सवाल टीम बेहतर बता पाएगी — WhatsApp +91 77019 03505 पर। या यहीं अपने डिटेल्स शेयर कीजिए।",
  ],
};

/**
 * Find an answer to a free-form question.
 * - Detects language (Hindi / Hinglish / English)
 * - Picks a non-repeating variant
 * - Falls back to a "talk to team" message if no intent matches
 */
export function findFaqAnswer(text: string): string {
  const lang = detectLanguage(text);
  const intent = findIntent(text);
  if (intent) {
    const variants = ANSWERS[intent][lang] ?? ANSWERS[intent].en;
    return pickVariant(`${intent}:${lang}`, variants);
  }
  const variants = FALLBACK[lang] ?? FALLBACK.en;
  return pickVariant(`fallback:${lang}`, variants);
}

/** Detect whether the user is showing buying intent (asks to start, share details, etc.) */
export function isBuyingIntent(text: string): boolean {
  const lower = text.toLowerCase();
  return [
    "let's do", "lets do", "i'm in", "im in", "share details",
    "kaise shuru", "shuru kar", "start kar", "kar de", "haan kar", "ok kar",
    "ready hoon", "ready hu", "go ahead", "kar do",
  ].some((p) => lower.includes(p));
}

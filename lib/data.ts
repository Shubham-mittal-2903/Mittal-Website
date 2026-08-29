import {
  Globe,
  Briefcase,
  ShoppingCart,
  Rocket,
  LayoutDashboard,
  Wand2,
  type LucideIcon,
} from "lucide-react";

export const BRAND = {
  name: "MITTAL.WEBSITE",
  poweredBy: "Powered by mittal.website",
  tagline: "Websites That Actually Grow Businesses.",
  email: "shubhammittal3555@gmail.com",
  phone: "+917701903505",
  phoneDisplay: "+91 77019 03505",
  whatsapp: "https://wa.me/917701903505",
  instagram: "https://www.instagram.com/mittal.website",
  startingPrice: "₹5,555",
};

export const ASSURANCE =
  "Register your project — our team coordinates with you within 24 hours.";

export type NavLink = { label: string; href: string };

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Solutions", href: "/#solutions" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Gallery", href: "/website-gallery" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/#contact" },
];

export const TRUST_LOGOS: string[] = ["Solid State Lights", "ClearMyChallan"];

export type Stat = { value: string; label: string };

export const STATS: Stat[] = [
  { value: "10-Day", label: "Average Delivery" },
  { value: "Fixed", label: "Pricing, No Surprises" },
  { value: "Founder-Led", label: "You Talk Directly To Us" },
  { value: "Free", label: "Strategy Consultation" },
];

export type Service = {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
};

export const SERVICES: Service[] = [
  {
    icon: Globe,
    title: "Business Websites",
    description:
      "Polished, fast-loading sites that make local businesses and startups look established and trustworthy from the first scroll.",
    features: ["Conversion-first layout", "Mobile perfect", "Lead capture", "Google-ready"],
  },
  {
    icon: Briefcase,
    title: "Portfolio Websites",
    description:
      "Standout personal brands for creators, freelancers and professionals who want their work to command premium attention.",
    features: ["Bespoke design", "Case study layouts", "Smooth animations", "Personal branding"],
  },
  {
    icon: ShoppingCart,
    title: "Ecommerce Websites",
    description:
      "Online stores engineered to sell — frictionless checkout, product storytelling and a buying experience customers trust.",
    features: ["Product catalog", "Secure checkout", "Payment gateways", "Inventory ready"],
  },
  {
    icon: Rocket,
    title: "Landing Pages",
    description:
      "High-converting landing pages built for ad campaigns and launches, tuned to turn clicks into qualified leads.",
    features: ["A/B ready", "Fast load", "Campaign tracking", "Persuasive copy"],
  },
  {
    icon: LayoutDashboard,
    title: "Web Applications",
    description:
      "Custom dashboards, portals and internal tools with authentication, databases and the workflows your business runs on.",
    features: ["Custom dashboards", "Auth & roles", "Database driven", "Scalable APIs"],
  },
  {
    icon: Wand2,
    title: "Website Redesign",
    description:
      "Transform outdated, slow websites into modern digital experiences that rebuild credibility and grow conversions.",
    features: ["Modern rebuild", "Speed boost", "SEO migration", "Brand refresh"],
  },
];

export type Package = {
  name: string;
  price: string;
  from?: boolean; // show "From" before price
  priceNote?: string; // e.g. "/month"
  marketPrice?: string; // typical agency rate, shown struck-through
  highlight?: boolean;
  badge?: string;
  tagline: string;
  features: string[];
  idealFor?: string;
  note?: string;
  cta: string;
};

export const PACKAGES: Package[] = [
  {
    name: "Starter Website",
    price: "₹5,555",
    marketPrice: "₹15,000",
    tagline:
      "The perfect, affordable launchpad — a clean, credible website that gets your business online fast.",
    features: [
      "Responsive Design",
      "Up To 5 Pages",
      "Mobile-Optimised",
      "Contact Form",
      "WhatsApp Integration",
      "Basic On-Page SEO",
      "Domain Connection",
      "Deployment Support",
    ],
    idealFor: "New businesses, local shops, professionals & personal brands",
    cta: "Get Started",
  },
  {
    name: "Business Website",
    price: "₹9,999",
    marketPrice: "₹30,000",
    highlight: true,
    badge: "Most Popular",
    tagline:
      "A premium custom website that makes you look established and turns visitors into real enquiries.",
    features: [
      "Everything in Starter",
      "Premium Custom Design",
      "Lead Generation Setup",
      "More Pages & Sections",
      "SEO-Friendly Structure",
      "Premium Animations",
      "Performance Optimised",
      "Priority Delivery",
    ],
    idealFor: "Businesses, Manufacturers, Agencies & Growing Brands",
    cta: "Get Started",
  },
  {
    name: "E-Commerce Website",
    price: "₹14,999",
    from: true,
    marketPrice: "₹50,000",
    tagline:
      "A complete online store that showcases your products beautifully and takes orders 24/7.",
    features: [
      "Product Catalog & Filters",
      "Category Management",
      "Shopping Cart",
      "Payment Gateway Integration",
      "Admin Panel",
      "Mobile Responsive Design",
      "SEO-Friendly Architecture",
      "Order Management",
    ],
    idealFor: "Retail Brands, Manufacturers & Product Businesses",
    cta: "Get Started",
  },
  {
    name: "Brand Growth Package",
    price: "₹6,999",
    priceNote: "/month",
    marketPrice: "₹15,000/mo",
    tagline:
      "Consistent, premium content that keeps your brand visible and generating leads every single month.",
    features: [
      "12 Premium Creatives / Month",
      "Product Showcase Posts",
      "Educational & Festival Posts",
      "Content Writing",
      "Branding Strategy",
      "WhatsApp Lead-Gen Focus",
      "Monthly Content Planning",
    ],
    idealFor: "Businesses with a website that want consistent online growth",
    cta: "Get Started",
  },
  {
    name: "SEO Foundation Package",
    price: "₹4,999",
    from: true,
    marketPrice: "₹12,000",
    tagline: "The technical groundwork your website needs to start getting found on Google.",
    features: [
      "Meta Titles & Descriptions",
      "Image Alt Tags",
      "Schema Markup",
      "Sitemap & Robots.txt Setup",
      "Technical SEO Audit",
      "Local SEO Foundation",
    ],
    idealFor: "Businesses that want to start ranking the right way",
    note: "This package builds the SEO foundation. Rankings depend on competition, content and ongoing SEO efforts.",
    cta: "Get Started",
  },
  {
    name: "Custom Business Solutions",
    price: "Custom Quote",
    tagline:
      "Custom software, automation and systems built around exactly how your business actually runs.",
    features: [
      "AI Automation",
      "Custom Dashboards",
      "CRM Systems",
      "Business Management Tools",
      "Lead Generation Systems",
      "Internal Software",
    ],
    idealFor: "Businesses needing tailored tools beyond a standard website",
    cta: "Request Quote",
  },
];

export type Project = {
  name: string;
  category: string;
  summary: string;
  tech: string[];
  gradient: string;
  initials: string;
  liveUrl?: string;
};

export const PROJECTS: Project[] = [
  {
    name: "Solid State Lights",
    category: "Industrial Product Website",
    summary:
      "A technical yet approachable product site for an LED lighting manufacturer, built to showcase products and generate B2B leads.",
    tech: ["Next.js", "Node", "Admin Panel"],
    gradient: "from-electric/40 to-gold/30",
    initials: "SS",
    liveUrl: "https://solidstate.co.in/",
  },
  {
    name: "Purva LED",
    category: "E-Commerce Storefront",
    summary:
      "An outdoor architectural LED lighting storefront rebuilt on Shopify with a full SEO and conversion overhaul for B2B and D2C buyers.",
    tech: ["Shopify", "SEO", "E-Commerce"],
    gradient: "from-gold/40 to-rosegold/30",
    initials: "PL",
    liveUrl: "https://purvaled.com/",
  },
  {
    name: "ClearMyChallan",
    category: "Traffic Challan Solution Platform",
    summary:
      "A utility-first web app that helps users resolve traffic challans quickly with a clean, reassuring user experience.",
    tech: ["Web App", "Auth", "Database"],
    gradient: "from-violet/40 to-gold/30",
    initials: "CM",
    liveUrl: "https://www.clearmychallan.co.in/",
  },
  {
    name: "4 Knotts Stationary",
    category: "Premium Notebook E-Commerce",
    summary:
      "A premium notebook brand's storefront with full account, cart and checkout flows — built end to end from design to backend.",
    tech: ["React 19", "Firebase", "Express"],
    gradient: "from-rosegold/40 to-electric/30",
    initials: "4K",
  },
  {
    name: "Noqify",
    category: "Browser Productivity Toolkit",
    summary:
      "An editorial, Apple-style rebuild of a premium browser-toolkit brand, built with cinematic scroll and motion throughout.",
    tech: ["Next.js 15", "GSAP", "Three.js"],
    gradient: "from-electric/40 to-violet/30",
    initials: "NQ",
  },
  {
    name: "Mittal Digital",
    category: "Agency Site & Internal CRM",
    summary:
      "This site — designed, built and run solo, including the client-facing brand and an internal AI-powered CRM (\"MITTAL OS\") behind it.",
    tech: ["Next.js 15", "Prisma", "AI Ops"],
    gradient: "from-champagne/40 to-electric/30",
    initials: "MD",
    liveUrl: "https://www.mittaldev.website/",
  },
];

export type PersonalProject = {
  name: string;
  category: string;
  summary: string;
  tech: string[];
  status: string;
};

export const PERSONAL_PROJECTS: PersonalProject[] = [
  {
    name: "JAYDEN AI",
    category: "Personal AI Operating System",
    summary:
      "A provider-agnostic AI engine with tiered memory and an agent system — the AI that now runs behind the MITTAL OS dashboard.",
    tech: ["Next.js", "Multi-Provider AI", "Agents"],
    status: "In Active Development",
  },
  {
    name: "Lumina AI",
    category: "AI Video Generator SaaS",
    summary:
      "A SaaS product for AI-generated video, with pluggable model providers, Stripe billing and cloud storage built in from day one.",
    tech: ["Next.js 15", "Stripe", "R2"],
    status: "In Development",
  },
  {
    name: "KNOTTBOX",
    category: "AI Teacher Co-Pilot",
    summary:
      "An EduMind AI teaching assistant with 14 education-specific prompt tools and per-school memory, built for real classrooms.",
    tech: ["Node.js", "Claude API", "Express"],
    status: "Backend Live",
  },
  {
    name: "Mark XXXIX-OR",
    category: "Voice Assistant",
    summary:
      "A JARVIS-style desktop voice assistant with live conversational AI and a custom PyQt6 interface.",
    tech: ["Python", "PyQt6", "Gemini Live"],
    status: "Running Locally",
  },
];

export type SkillGroup = { label: string; skills: string[] };

export const SKILLS: SkillGroup[] = [
  { label: "Frontend", skills: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion"] },
  { label: "Backend", skills: ["Node.js", "Express", "Prisma", "PostgreSQL", "MongoDB"] },
  { label: "AI & Automation", skills: ["Claude API", "Multi-Model Orchestration", "RAG", "Agents"] },
  { label: "Other", skills: ["Firebase", "Shopify", "Python", "SEO", "Stripe"] },
];

export type ProcessStep = { step: string; title: string; description: string };

export const PROCESS: ProcessStep[] = [
  { step: "01", title: "Discovery Call", description: "We learn your business, goals and audience." },
  { step: "02", title: "Planning & Strategy", description: "We map the structure, content and conversion path." },
  { step: "03", title: "Design Approval", description: "You review and sign off on a premium design direction." },
  { step: "04", title: "Development", description: "We build fast, responsive and pixel-perfect." },
  { step: "05", title: "Testing", description: "We test across devices, speed and SEO." },
  { step: "06", title: "Launch", description: "We deploy and hand over a website ready to grow." },
];

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  initials: string;
};

export const TESTIMONIALS: Testimonial[] = [];

export type FAQItem = { question: string; answer: string };

export const FAQS: FAQItem[] = [
  {
    question: "I want to get a website made — how do I start?",
    answer:
      "Simple. Register your project using the contact form below or message us on WhatsApp at +91 77019 03505. Our team coordinates with you within 24 hours, plans everything, and your premium website is usually delivered within 10 days.",
  },
  {
    question: "How much does it cost to get a website made in India?",
    answer:
      "Our websites start from just ₹5,555 (Starter), ₹9,999 (Business) and ₹14,999 (E-Commerce) — a fraction of typical agency rates. The final price depends on pages, features and integrations, and we share a clear, fixed quote on a free consultation before any work begins, with no hidden charges.",
  },
  {
    question: "Do you build websites for businesses in Delhi NCR?",
    answer:
      "Yes — we're a Delhi NCR based web development agency working with startups, local businesses, restaurants and brands across Delhi, Noida, Gurugram, Ghaziabad and Faridabad, as well as clients all over India. Everything is handled online, so distance is never an issue.",
  },
  {
    question: "How long does a website take?",
    answer:
      "Usually within 10 days depending on complexity. Simple sites can be faster, while custom web apps may take a little longer — we confirm an exact timeline on our discovery call.",
  },
  {
    question: "Do you provide hosting?",
    answer:
      "Hosting can be arranged separately based on your needs. We'll recommend the best, most cost-effective option and can set everything up for you.",
  },
  {
    question: "Do I need a domain?",
    answer:
      "Yes, a domain is required and its cost is separate. If you don't have one yet, we'll help you choose and register the perfect domain for your brand.",
  },
  {
    question: "Do you build custom systems?",
    answer:
      "Yes. We build custom dashboards, portals, authentication, databases and complex web applications tailored precisely to how your business operates.",
  },
  {
    question: "Who owns the website after it's delivered?",
    answer:
      "You do — 100%. Once the final payment is made, the website, code, content and accounts are completely yours. There's no lock-in, and you're free to host or manage it wherever you like.",
  },
  {
    question: "How many revisions are included?",
    answer:
      "Every package includes 2 rounds of revisions on the design so we get it exactly right. We share progress at each stage, so there are no surprises at the end.",
  },
  {
    question: "Is payment in milestones?",
    answer:
      "Yes. For most projects we work on a simple 50% advance to start and 50% on completion before launch. For larger or monthly engagements we agree a clear milestone schedule upfront.",
  },
  {
    question: "Can I see my website before paying the full amount?",
    answer:
      "Absolutely. You'll see the design and a live staging link of your website before the final payment, so you know exactly what you're getting before it goes live.",
  },
  {
    question: "Do you provide support after launch?",
    answer:
      "Yes. Every project includes a support window after launch for fixes, and we offer optional ongoing maintenance if you'd like us to keep your site updated long-term.",
  },
  {
    question: "Can you redesign existing websites?",
    answer:
      "Absolutely. We rebuild outdated, slow websites into modern, high-converting sites while preserving your existing SEO.",
  },
];

export const BUDGET_RANGES = [
  "Under ₹10,000",
  "₹10,000 – ₹25,000",
  "₹25,000 – ₹50,000",
  "₹50,000 – ₹1,00,000",
  "₹1,00,000+",
];

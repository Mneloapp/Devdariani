import type { Locale } from "./locales";

export const systems = [
  "Structure",
  "HVAC",
  "Electrical",
  "Plumbing",
  "Fire Protection",
  "BMS",
  "Procurement",
  "Commissioning",
  "Orchestrics™",
] as const;

export type ChapterId =
  | "home"
  | "philosophy"
  | "approach"
  | "systems"
  | "orchestrics"
  | "work"
  | "contact";

type Step = {
  title: string;
  body: string;
};

export type ChapterCopy = {
  id: ChapterId;
  number: string;
  nav: string;
  title: string;
  eyebrow?: string;
  support?: string;
  cta?: string;
  steps?: Step[];
  principles?: string[];
};

export type ExperienceCopy = {
  locale: Locale;
  meta: {
    languageLabel: string;
    menu: string;
    selectedWorkSoon: string;
    contactEmail: string;
  };
  chapters: ChapterCopy[];
};

const en: ExperienceCopy = {
  locale: "en",
  meta: {
    contactEmail: "info@devdariani.com",
    languageLabel: "EN",
    menu: "Menu",
    selectedWorkSoon: "Selected work will be published shortly.",
  },
  chapters: [
    {
      cta: "Explore the Approach",
      eyebrow: "The Art of Orchestrics™",
      id: "home",
      nav: "Home",
      number: "00",
      support:
        "We orchestrate complex building systems into one intelligent, coordinated whole.",
      title: "DEVDARIANI",
    },
    {
      id: "philosophy",
      nav: "Philosophy",
      number: "01",
      support: "Complexity is inevitable.\nFragmentation is optional.",
      title: "Modern buildings are no longer built.\nThey are orchestrated.",
    },
    {
      id: "approach",
      nav: "Approach",
      number: "02",
      steps: [
        { body: "Understand the full project ecosystem.", title: "Analyze" },
        { body: "Map dependencies, influence and risk.", title: "Relate" },
        { body: "Align systems, teams and information.", title: "Coordinate" },
        { body: "Deliver one coherent, high-performing whole.", title: "Orchestrate" },
      ],
      title: "From Fragmentation to Orchestrics™",
    },
    {
      id: "systems",
      nav: "Systems",
      number: "03",
      title: "Every system has a role.\nEvery role creates relationships.",
    },
    {
      id: "orchestrics",
      nav: "Orchestrics",
      number: "04",
      principles: ["Perfect Control", "Quiet Confidence", "Precision in Every Detail"],
      support:
        "A methodology for transforming complex engineering projects into coordinated, high-performing systems.",
      title: "Orchestrics™",
    },
    {
      id: "work",
      nav: "Work",
      number: "05",
      title: "Selected Work",
    },
    {
      cta: "Start the Conversation",
      id: "contact",
      nav: "Contact",
      number: "06",
      support:
        "If your project demands coordination instead of compromise, start the conversation.",
      title: "Let’s build what matters.",
    },
  ],
};

const ka: ExperienceCopy = {
  locale: "ka",
  meta: {
    contactEmail: "info@devdariani.com",
    languageLabel: "KA",
    menu: "მენიუ",
    selectedWorkSoon: "შერჩეული პროექტები მალე გამოქვეყნდება.",
  },
  chapters: [
    {
      cta: "გაეცანი მიდგომას",
      eyebrow: "Orchestrics™-ის ხელოვნება",
      id: "home",
      nav: "მთავარი",
      number: "00",
      support:
        "ჩვენ რთულ საინჟინრო სისტემებს ერთიან, ინტელექტუალურ და კოორდინირებულ მთლიანობად ვაქცევთ.",
      title: "DEVDARIANI",
    },
    {
      id: "philosophy",
      nav: "ფილოსოფია",
      number: "01",
      support: "სირთულე გარდაუვალია.\nფრაგმენტაცია — არჩევანი.",
      title:
        "თანამედროვე შენობები აღარ იქმნება ცალკეული სისტემების ჯამით.\nისინი ორკესტრირდება.",
    },
    {
      id: "approach",
      nav: "მიდგომა",
      number: "02",
      steps: [
        { body: "ვხედავთ პროექტის სრულ ეკოსისტემას.", title: "ანალიზი" },
        { body: "ვადგენთ დამოკიდებულებებს, გავლენებსა და რისკებს.", title: "კავშირები" },
        { body: "ვათანხმებთ სისტემებს, გუნდებსა და ინფორმაციას.", title: "კოორდინაცია" },
        { body: "ვქმნით ერთიან, გამართულ და მაღალეფექტიან მთლიანობას.", title: "ორკესტრირება" },
      ],
      title: "ფრაგმენტაციიდან Orchestrics™-მდე",
    },
    {
      id: "systems",
      nav: "სისტემები",
      number: "03",
      title: "თითოეულ სისტემას თავისი როლი აქვს.\nთითოეული როლი ქმნის კავშირებს.",
    },
    {
      id: "orchestrics",
      nav: "Orchestrics",
      number: "04",
      principles: ["სრული კონტროლი", "მშვიდი თავდაჯერება", "სიზუსტე თითოეულ დეტალში"],
      support:
        "მეთოდოლოგია, რომელიც რთულ საინჟინრო პროექტებს ერთიან, კოორდინირებულ და მაღალეფექტიან სისტემებად გარდაქმნის.",
      title: "Orchestrics™",
    },
    {
      id: "work",
      nav: "პროექტები",
      number: "05",
      title: "შერჩეული პროექტები",
    },
    {
      cta: "დავიწყოთ საუბარი",
      id: "contact",
      nav: "კონტაქტი",
      number: "06",
      support:
        "თუ თქვენი პროექტი კომპრომისის ნაცვლად კოორდინაციას მოითხოვს, დავიწყოთ საუბარი.",
      title: "შევქმნათ ის, რასაც მნიშვნელობა აქვს.",
    },
  ],
};

export const copy: Record<Locale, ExperienceCopy> = { en, ka };

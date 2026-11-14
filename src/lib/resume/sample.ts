import { RESUME_SCHEMA_VERSION, type Resume } from "./schema";

// ============================================================================
// Sample resume: a fictional person used for template previews, the landing
// page gallery and "start from example" in the editor.
//
// Everything here is made up. Companies, schools, issuers and links are
// fictional and point at example.com, so no real person or organisation is
// represented.
// ============================================================================

export const sampleResume: Resume = {
  schemaVersion: RESUME_SCHEMA_VERSION,

  profile: {
    name: "Alex Morgan",
    role: "Full Stack Developer",
    tagline: "Building fast, accessible web products. 5 years shipping with TypeScript.",
    location: "Portland, OR",
    avatar: "/avatar.png",
    resumeUrl: "/John_Doe_Resume.pdf",
    availability: "Open to new opportunities",
    socials: {
      github: "https://github.com/example",
      linkedin: "https://www.linkedin.com/in/example",
      email: "alex.morgan@example.com",
    },
  },

  about:
    "**Full stack developer** with five years of experience building web products end to end. Comfortable across the stack with **TypeScript, React, Next.js and Node.js** on the front, and **Python, PostgreSQL and REST/GraphQL APIs** on the back. I care about **performance, accessibility** and clean, well-tested code, and I enjoy mentoring and turning vague ideas into shipped features.",

  experience: [
    {
      title: "Senior Software Engineer",
      company: "Northwind Labs",
      date: "Mar 2023 - Present",
      location: "Remote",
      responsibilities: [
        "Lead a team of four building the customer dashboard used by **12k+ businesses**.",
        "Cut page load time by **45%** by moving to server components and edge caching.",
        "Introduced end-to-end testing and preview deployments, halving production incidents.",
      ],
      skills: ["TypeScript", "Next.js", "PostgreSQL", "AWS", "Playwright"],
    },
    {
      title: "Software Engineer",
      company: "Bluepeak Software",
      date: "Jun 2021 - Feb 2023",
      location: "Seattle, WA",
      responsibilities: [
        "Built and maintained REST and GraphQL APIs serving **2M requests/day**.",
        "Designed the role-based access control system for enterprise customers.",
        "Mentored two junior engineers through onboarding and their first launches.",
      ],
      skills: ["Node.js", "GraphQL", "React", "Docker", "Redis"],
    },
    {
      title: "Junior Web Developer",
      company: "Copperleaf Studio",
      date: "Aug 2020 - May 2021",
      location: "Portland, OR",
      responsibilities: [
        "Delivered 15+ marketing sites and storefronts for small-business clients.",
        "Built a reusable component library that sped up new projects by about 30%.",
      ],
      skills: ["JavaScript", "React", "WordPress", "CSS"],
    },
    {
      title: "Data Analyst Intern",
      company: "Riverstone Analytics",
      date: "May 2019 - Aug 2019",
      location: "Boston, MA",
      responsibilities: [
        "Cleaned and analysed large datasets to surface key sales trends.",
        "Prepared reports and visualisations for senior analysts.",
      ],
      skills: ["SQL", "Python (Pandas)", "Excel", "Data Visualization"],
    },
  ],

  projects: [
    {
      name: "Trailmark",
      description: "An open-source habit tracker with streaks, reminders and offline sync.",
      github: "https://github.com/example/trailmark",
      demo: "https://trailmark.example.com/",
      details: [
        "Offline-first PWA that syncs across devices when back online.",
        "Push reminders and weekly progress summaries.",
        "Fully keyboard accessible and WCAG AA compliant.",
      ],
      technologies: ["Next.js", "TypeScript", "IndexedDB", "Tailwind CSS"],
    },
    {
      name: "Ledgerly",
      description: "A small-business invoicing and expense dashboard.",
      github: "https://github.com/example/ledgerly",
      demo: "https://ledgerly.example.com/",
      details: [
        "Generates PDF invoices and tracks payments and overdue reminders.",
        "Interactive charts for cash flow and expense categories.",
        "Multi-tenant Postgres schema with row-level security.",
      ],
      technologies: ["React", "Node.js", "PostgreSQL", "D3.js"],
    },
    {
      name: "Quill API",
      description: "A REST API for collaborative note-taking with real-time updates.",
      github: "https://github.com/example/quill-api",
      details: [
        "WebSocket broadcast of edits with conflict resolution.",
        "JWT authentication with refresh-token rotation.",
        "Containerised with Docker and deployed via CI/CD.",
      ],
      technologies: ["Python", "Django REST Framework", "Redis", "Docker"],
    },
    {
      name: "Pocket Recipes",
      description: "A cross-platform mobile app for saving and planning recipes.",
      github: "https://github.com/example/pocket-recipes",
      details: [
        "Imports recipes from any URL and scales ingredient quantities.",
        "Weekly meal planner that builds a shopping list automatically.",
      ],
      technologies: ["React Native", "Expo", "Firebase"],
    },
  ],

  skills: [
    { name: "TypeScript", icon: "code", repos: ["trailmark", "ledgerly"] },
    { name: "React", icon: "globe", repos: ["ledgerly", "pocket-recipes"] },
    { name: "Next.js", icon: "globe", repos: ["trailmark"] },
    { name: "Node.js", icon: "cpu", repos: ["ledgerly"] },
    { name: "Python", icon: "code", repos: ["quill-api"] },
    { name: "PostgreSQL", icon: "database", repos: ["ledgerly"] },
    {
      name: "WordPress",
      icon: "file",
      repos: [],
      sites: [
        {
          title: "Harbor Coffee Co.",
          url: "https://harbor-coffee.example.com/",
          description: "Custom theme and online ordering for a local coffee roaster.",
          tags: ["WordPress", "Custom Theme", "WooCommerce"],
        },
        {
          title: "Greenline Yoga",
          url: "https://greenline-yoga.example.com/",
          description: "Class schedule and booking site for a yoga studio.",
          tags: ["WordPress", "Booking", "Responsive Design"],
        },
      ],
    },
    { name: "Docker", icon: "folder", repos: ["quill-api"] },
  ],

  tools: [
    { name: "Cloud & Hosting", skills: ["AWS", "Vercel", "Firebase", "Supabase"] },
    { name: "Development", skills: ["VS Code", "Postman", "Figma", "Jupyter"] },
    { name: "DevOps & Version Control", skills: ["Docker", "Git", "GitHub Actions"] },
    { name: "Testing", skills: ["Vitest", "Playwright", "Jest"] },
  ],

  education: [
    {
      institution: "Westbrook University",
      degree: "B.S. in Computer Science",
      period: "2016 - 2020",
      location: "Boston, MA",
    },
    {
      institution: "Lakeside High School",
      degree: "High School Diploma",
      period: "2012 - 2016",
      location: "Portland, OR",
    },
  ],

  certifications: [
    {
      name: "Cloud Practitioner",
      issuer: "Example Cloud Academy",
      date: "Apr 2024",
      link: "https://example.com/certificate",
      icon: "globe",
      description: "Core cloud concepts, pricing, security and the shared responsibility model.",
    },
    {
      name: "Advanced React Patterns",
      issuer: "Frontend Guild",
      date: "Nov 2023",
      link: "https://example.com/certificate",
      icon: "code",
      description: "Compound components, render optimisation, and state management at scale.",
    },
    {
      name: "PostgreSQL Performance",
      issuer: "Data School",
      date: "Jun 2022",
      link: "https://example.com/certificate",
      icon: "database",
      description: "Indexing strategies, query planning and tuning for production databases.",
    },
    {
      name: "Machine Learning Foundations",
      issuer: "Open Learning Institute",
      date: "Jan 2022",
      link: "https://example.com/certificate",
      icon: "brain",
      description: "Supervised learning, model evaluation and practical feature engineering.",
    },
    {
      name: "Hackathon Winner",
      issuer: "City Code Jam",
      date: "Oct 2021",
      link: "https://example.com/certificate",
      icon: "trophy",
      description: "First place out of 60 teams for an accessibility-focused transit app.",
    },
  ],
};

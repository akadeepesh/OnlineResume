// ============================================================================
// Single source of truth for all resume content.
// Every template reads from this file — edit your details here once and they
// show up in whichever template is active.
// ============================================================================

export type IconKey =
  | "code"
  | "cpu"
  | "brain"
  | "trophy"
  | "database"
  | "globe"
  | "folder"
  | "file";

export interface Profile {
  name: string;
  role: string;
  tagline: string;
  location: string;
  avatar: string;
  resumeUrl: string;
  /** Short status line, e.g. "Open to full-time roles" */
  availability?: string;
  socials: {
    github: string;
    linkedin: string;
    email: string;
  };
}

/** Wrap text in **double asterisks** to emphasise it. */
export type RichText = string;

export interface ExperienceEntry {
  title: string;
  company: string;
  date: string;
  location: string;
  responsibilities: string[];
  skills: string[];
}

export interface Project {
  name: string;
  description: string;
  github: string;
  demo?: string;
  details: string[];
  technologies: string[];
}

export interface Site {
  title: string;
  url: string;
  description: string;
  tags: string[];
}

export interface Skill {
  name: string;
  icon: IconKey;
  /** GitHub repository names (under NEXT_PUBLIC_GH_OWNER) that use this skill */
  repos: string[];
  /** Live sites built with this skill — shown instead of / alongside repos */
  sites?: Site[];
}

export interface ToolCategory {
  name: string;
  skills: string[];
}

export interface EducationEntry {
  institution: string;
  degree: string;
  period: string;
  location: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  link: string;
  icon: IconKey;
  description: string;
}

export const profile: Profile = {
  name: "Deepesh Kumar",
  role: "Full Stack Web Developer",
  tagline: "Open Source Software Developer. Final year at MIT.",
  location: "Chicago, USA",
  avatar: "/avatar.png",
  resumeUrl: "/John_Doe_Resume.pdf",
  availability: "Open to new opportunities",
  socials: {
    github: "https://github.com/john",
    linkedin: "https://www.linkedin.com/in/John/",
    email: "johndoe@gmail.com",
  },
};

export const about: RichText =
  "**Software developer** and final-year student at MIT. Proficient in **Python, JavaScript, TypeScript, and C/C++**, with expertise in **backend development using Django**. Experienced in creating **REST APIs**, implementing **authentication systems & authorisation flows**, and working with databases like **MySQL and PostgreSQL**. Skilled in **Full Stack Web Development**, specializing in **Next.js** and **Backend-as-a-Service (BaaS)** solutions for JavaScript-based projects.";

export const experience: ExperienceEntry[] = [
  {
    title: "Software Development Engineer",
    company: "Upside Down Labs",
    date: "3 Jun 2024 - 3 Aug 2024",
    location: "SA, USA",
    responsibilities: [],
    skills: [],
  },
  {
    title: "Software Engineer",
    company: "Tech Solutions Inc.",
    date: "Jan 2022 - Present",
    location: "San Francisco, CA",
    responsibilities: [
      "Developed and maintained scalable web applications using modern JavaScript frameworks.",
      "Collaborated with cross-functional teams to define, design, and ship new features.",
      "Participated in code reviews and contributed to improving code quality and team best practices.",
    ],
    skills: ["JavaScript", "React", "Node.js", "AWS", "Docker"],
  },
  {
    title: "Python Developer",
    company: "MFTS Corp",
    date: "1 Jun 2023 - 31 Jul 2023",
    location: "Seattle",
    responsibilities: [],
    skills: [],
  },
  {
    title: "Data Analyst Intern",
    company: "Data Insights Co.",
    date: "May 2019 - Aug 2019",
    location: "Boston, MA",
    responsibilities: [
      "Assisted in collecting, cleaning, and analyzing large datasets to identify key trends.",
      "Prepared reports and visualizations to present findings to senior analysts.",
      "Gained hands-on experience with SQL and various data visualization tools.",
    ],
    skills: [
      "SQL",
      "Excel",
      "Data Visualization",
      "Python (Pandas)",
      "Statistical Analysis",
    ],
  },
];

export const projects: Project[] = [
  {
    name: "Project A - Portfolio Website",
    description:
      "A responsive portfolio website template built with modern web technologies.",
    github: "https://github.com/placeholder/project-a",
    demo: "https://project-a-demo.vercel.app/",
    details: [
      "Showcases a clean, modern design suitable for various professional portfolios.",
      "Includes sections for projects, experience, skills, and contact information.",
      "Optimized for performance and SEO, ensuring a fast and discoverable online presence.",
    ],
    technologies: ["React", "Next.js", "Tailwind CSS", "TypeScript"],
  },
  {
    name: "Project B - Data Dashboard",
    description:
      "An interactive data visualization dashboard for business analytics.",
    github: "https://github.com/placeholder/project-b",
    demo: "https://project-b-demo.vercel.app/",
    details: [
      "Features dynamic charts and graphs to represent complex datasets clearly.",
      "Provides customizable widgets and real-time data updates for informed decision-making.",
      "Designed with a focus on user experience, offering intuitive navigation and data exploration.",
    ],
    technologies: ["Vue.js", "D3.js", "Node.js", "Express", "PostgreSQL"],
  },
  {
    name: "Project C - Mobile E-commerce App",
    description: "A cross-platform mobile application for online shopping.",
    github: "https://github.com/placeholder/project-c",
    details: [
      "Enables users to browse products, add items to cart, and complete secure purchases.",
      "Incorporates user authentication, product search, and order history features.",
      "Built with a single codebase for both iOS and Android platforms, ensuring broad accessibility.",
    ],
    technologies: ["React Native", "Firebase", "Redux", "Stripe API"],
  },
  {
    name: "Project D - Task Management API",
    description:
      "A robust backend API for managing tasks and user productivity.",
    github: "https://github.com/placeholder/project-d",
    details: [
      "Offers endpoints for creating, reading, updating, and deleting tasks.",
      "Includes user authentication and authorization to secure task data.",
      "Designed for scalability and easy integration with various frontend applications.",
    ],
    technologies: ["Python", "Django REST Framework", "Docker", "MongoDB"],
  },
];

export const skills: Skill[] = [
  {
    name: "Python",
    icon: "code",
    repos: ["Python Project 1", "Python Project 2", "Python Project 3"],
  },
  {
    name: "Django",
    icon: "code",
    repos: ["Django Project 1", "Django Project 2", "Django Project 3"],
  },
  {
    name: "Next.js",
    icon: "globe",
    repos: ["Next.js Project 1", "Next.js Project 2", "Next.js Project 3"],
  },
  {
    name: "TypeScript",
    icon: "code",
    repos: [
      "TypeScript Project 1",
      "TypeScript Project 2",
      "TypeScript Project 3",
    ],
  },
  {
    name: "React.js",
    icon: "globe",
    repos: ["React Project 1", "React Project 2"],
  },
  {
    name: "WordPress",
    icon: "file",
    repos: [],
    sites: [
      {
        title: "Upside Down Labs",
        url: "https://upsidedownlabs.tech/",
        description:
          "Contributed to the development of the Upside Down Labs website.",
        tags: ["WordPress", "Custom Theme", "Responsive Design"],
      },
      {
        title: "Upside Down Labs Store",
        url: "https://store.upsidedownlabs.tech/",
        description:
          "Contributed to DIY Neuroscience Kits store page for Upside Down Labs.",
        tags: ["WooCommerce", "E-commerce", "Product Showcase"],
      },
    ],
  },
  {
    name: "JavaScript",
    icon: "code",
    repos: [
      "quizify",
      "MySky",
      "ML_Automation_Frontend",
      "DataVisualizationWeb",
      "VirtualAssistant",
      "UserAuth",
      "DjangoAuth",
      "VirtualMentor",
    ],
  },
  { name: "SQL", icon: "database", repos: ["BankManagement-Python"] },
  { name: "C/C++", icon: "code", repos: ["Cpp-DSA"] },
  {
    name: "HTML/CSS",
    icon: "folder",
    repos: [
      "John-Portfolio",
      "chrome_personalization",
      "HappyBirthday",
      "KeepItSimple",
      "Page_404",
      "Django",
    ],
  },
];

export const tools: ToolCategory[] = [
  {
    name: "Cloud & BaaS",
    skills: ["AWS", "Firebase", "Vercel", "Supabase", "Convex dev"],
  },
  {
    name: "Development Tools",
    skills: ["VS Code", "PyCharm", "Jupyter", "Sublime Text", "Postman"],
  },
  {
    name: "DevOps & Version Control",
    skills: ["Docker", "Git", "GitHub"],
  },
  {
    name: "Operating Systems",
    skills: ["Windows", "Ubuntu", "Fedora"],
  },
];

export const education: EducationEntry[] = [
  {
    institution: "MIT",
    degree: "Bachelor of Technology",
    period: "2021 - 2025 (expected)",
    location: "Chicago, USA",
  },
  {
    institution: "Cambridge High School",
    degree: "High School",
    period: "2019 - 2021",
    location: "Dallas, USA",
  },
];

export const certifications: Certification[] = [
  {
    name: "Python (Basic)",
    issuer: "HackerRank",
    date: "Feb 2022",
    link: "https://example.com/certificate",
    icon: "code",
    description:
      "Demonstrated proficiency in Python fundamentals, including data types, control structures, and basic problem-solving skills.",
  },
  {
    name: "C/C++",
    issuer: "Aptech Learning",
    date: "Feb 2022",
    link: "https://example.com/certificate",
    icon: "cpu",
    description:
      "Mastered core concepts of C and C++ programming, including memory management, object-oriented programming, and standard libraries.",
  },
  {
    name: "Problem Solving (Basic)",
    issuer: "HackerRank",
    date: "Sep 2022",
    link: "https://example.com/certificate",
    icon: "brain",
    description:
      "Developed strong analytical and algorithmic thinking skills to solve a variety of coding challenges efficiently.",
  },
  {
    name: "C++ DSA",
    issuer: "DevTown",
    date: "Oct 2022",
    link: "https://example.com/certificate",
    icon: "code",
    description:
      "Advanced understanding of Data Structures and Algorithms implementation in C++, enhancing problem-solving capabilities.",
  },
  {
    name: "Hopin Badge",
    issuer: "Hopin",
    date: "Jan 2023",
    link: "https://example.com/certificate",
    icon: "trophy",
    description:
      "Earned the Hopin Badge for outstanding performance in Hacktoberfest 2023, finishing globally 11th. This achievement demonstrates exceptional contribution to open-source projects and collaboration within the developer community.",
  },
  {
    name: "SQL (Basic)",
    issuer: "HackerRank",
    date: "Feb 2023",
    link: "https://example.com/certificate",
    icon: "database",
    description:
      "Acquired fundamental SQL skills for database querying, including SELECT statements, filtering, and basic joins.",
  },
  {
    name: "Microsoft AI Skills Challenge",
    issuer: "Microsoft",
    date: "Jan 2024",
    link: "https://example.com/certificate",
    icon: "brain",
    description:
      "Explored cutting-edge AI technologies and their practical applications in solving real-world problems.",
  },
  {
    name: "Microsoft Learn Student Ambassador",
    issuer: "Microsoft Azure",
    date: "Mar 2024",
    link: "https://example.com/certificate",
    icon: "globe",
    description:
      "Recognized for leadership in promoting Microsoft technologies and fostering a learning community on campus.",
  },
  {
    name: "Microsoft Learn Student Ambassador",
    issuer: "Microsoft",
    date: "Mar 2024",
    link: "https://example.com/certificate",
    icon: "globe",
    description:
      "Demonstrated expertise in Microsoft technologies and commitment to sharing knowledge with peers.",
  },
  {
    name: "Postman API Fundamentals Student Expert",
    issuer: "Postman",
    date: "Aug 2024",
    link: "https://example.com/certificate",
    icon: "code",
    description:
      "Mastered API testing and development using Postman, showcasing proficiency in API workflows and documentation.",
  },
];

export const resume = {
  profile,
  about,
  experience,
  projects,
  skills,
  tools,
  education,
  certifications,
};

export type Resume = typeof resume;

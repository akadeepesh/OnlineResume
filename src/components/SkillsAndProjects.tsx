"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github,
  Code,
  Folder,
  Database,
  FileCode,
  Globe,
  Star,
  GitFork,
  ArrowUpRight,
  Activity,
  AlertCircle,
} from "lucide-react";
import WordPressSkills from "./WordPressSkills";

type Skill =
  | "Python"
  | "Django"
  | "Next.js"
  | "TypeScript"
  | "React.js"
  | "WordPress"
  | "JavaScript"
  | "SQL"
  | "C/C++"
  | "HTML/CSS";

interface ProjectInfo {
  name: string;
}

type SkillProjects = {
  [key in Skill]: ProjectInfo[];
};

// ====== Projects mapped to skills ======
const skillProjects: SkillProjects = {
  Python: [
    { name: "Python Project 1" },
    { name: "Python Project 2" },
    { name: "Python Project 3" },
  ],
  TypeScript: [
    { name: "TypeScript Project 1" },
    { name: "TypeScript Project 2" },
    { name: "TypeScript Project 3" },
  ],
  "Next.js": [
    { name: "Next.js Project 1" },
    { name: "Next.js Project 2" },
    { name: "Next.js Project 3" },
  ],
  Django: [
    { name: "Django Project 1" },
    { name: "Django Project 2" },
    { name: "Django Project 3" },
  ],
  "React.js": [{ name: "React Project 1" }, { name: "React Project 2" }],
  WordPress: [],
  JavaScript: [
    { name: "quizify" },
    { name: "MySky" },
    { name: "ML_Automation_Frontend" },
    { name: "DataVisualizationWeb" },
    { name: "VirtualAssistant" },
    { name: "UserAuth" },
    { name: "DjangoAuth" },
    { name: "VirtualMentor" },
  ],
  SQL: [{ name: "BankManagement-Python" }],
  "C/C++": [{ name: "Cpp-DSA" }],
  "HTML/CSS": [
    { name: "John-Portfolio" },
    { name: "chrome_personalization" },
    { name: "HappyBirthday" },
    { name: "KeepItSimple" },
    { name: "Page_404" },
    { name: "Django" },
  ],
};

// ====== Skill Icons ======
const getSkillIcon = (skill: Skill) => {
  switch (skill) {
    case "Python":
    case "Django":
    case "TypeScript":
    case "JavaScript":
    case "C/C++":
      return <Code className="w-5 h-5" />;
    case "Next.js":
    case "React.js":
      return <Globe className="w-5 h-5" />;
    case "WordPress":
      return <FileCode className="w-5 h-5" />;
    case "SQL":
      return <Database className="w-5 h-5" />;
    case "HTML/CSS":
      return <Folder className="w-5 h-5" />;
    default:
      return <Code className="w-5 h-5" />;
  }
};

// ====== Repo Data ======
interface RepoData {
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  description: string;
  open_issues_count: number;
  topics: string[];
  size: number;
}

// ====== Project Card ======
const ProjectCard: React.FC<ProjectInfo> = ({ name }) => {
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchRepoData = async () => {
      try {
        const response = await fetch(`/api/github/${name}`);
        if (response.ok) {
          const data = await response.json();
          setRepoData(data);
        } else {
          setError(true);
        }
      } catch (error) {
        console.error("Error fetching repo data:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchRepoData();
  }, [name]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatSize = (bytes: number) => {
    const kb = bytes;
    if (kb < 1024) return `${kb} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const getTopicColor = (index: number) => {
    const colors = [
      "bg-blue-50 text-blue-700 border-blue-200",
      "bg-purple-50 text-purple-700 border-purple-200",
      "bg-green-50 text-green-700 border-green-200",
      "bg-rose-50 text-rose-700 border-rose-200",
      "bg-amber-50 text-amber-700 border-amber-200",
    ];
    return colors[index % colors.length];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full bg-white dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-800 relative overflow-hidden"
    >
      <Link
        href={`https://github.com/placeholder/${name}`}
        target="_blank"
        className="block p-6 relative z-10"
      >
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.05 }}
            className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 z-0"
          />
        )}

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <Github className="w-6 h-6 text-gray-700 dark:text-gray-300 flex-shrink-0" />
              {isHovered && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
              {name}
            </h3>
          </div>

          {loading && (
            <div className="animate-pulse flex items-center space-x-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-12"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-8"></div>
            </div>
          )}

          {repoData && (
            <div className="flex items-center gap-4 text-sm">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-full"
              >
                <Star className="w-4 h-4" />
                <span>{repoData.stargazers_count}</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full"
              >
                <GitFork className="w-4 h-4" />
                <span>{repoData.forks_count}</span>
              </motion.div>
              {repoData.open_issues_count > 0 && (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="flex items-center gap-1 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded-full"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>{repoData.open_issues_count}</span>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {loading && (
          <p className="mt-3 text-sm text-gray-400 dark:text-gray-600">
            Loading description...
          </p>
        )}

        {repoData?.description && (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {repoData.description}
          </p>
        )}

        {repoData?.topics && repoData.topics.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {repoData.topics.slice(0, 5).map((topic: string, index: number) => (
              <motion.span
                key={topic}
                whileHover={{ scale: 1.05 }}
                className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getTopicColor(
                  index
                )}`}
              >
                {topic}
              </motion.span>
            ))}
          </div>
        )}

        {repoData && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span>Updated {formatDate(repoData.updated_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span>{formatSize(repoData.size)}</span>
            </div>
          </div>
        )}

        {error && (
          <p className="mt-3 text-sm text-red-500 dark:text-red-400">
            Failed to load repository data. Try again later.
          </p>
        )}
      </Link>
    </motion.div>
  );
};

// ====== Skill Dialog ======
interface SkillDialogProps {
  skill: Skill;
}

const SkillDialog: React.FC<SkillDialogProps> = ({ skill }) => (
  <Dialog>
    <DialogTrigger asChild>
      <Badge
        className="cursor-pointer transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
        variant="secondary"
      >
        <span className="flex items-center gap-2">
          {getSkillIcon(skill)}
          {skill}
        </span>
      </Badge>
    </DialogTrigger>
    <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
      <div className="p-6 bg-gradient-to-br from-background to-secondary">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {getSkillIcon(skill)}
            {skill} Projects
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <AnimatePresence>
            <div className="grid grid-cols-1 gap-4">
              {skillProjects[skill].length > 0 ? (
                skillProjects[skill].map((project, index) => (
                  <ProjectCard key={index} {...project} />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="col-span-2"
                >
                  <WordPressSkills />
                </motion.div>
              )}
            </div>
          </AnimatePresence>
        </ScrollArea>
      </div>
    </DialogContent>
  </Dialog>
);

// ====== Main Component ======
const SkillsAndProjects: React.FC = () => {
  return (
    <Card className="mt-8 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          Skills & Projects
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {Object.keys(skillProjects).map((skill) => (
            <motion.div
              key={skill}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <SkillDialog skill={skill as Skill} />
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default SkillsAndProjects;

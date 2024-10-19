"use client";

import React from "react";
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
import { Github, Code, Folder, Database, FileCode, Globe } from "lucide-react";
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

const skillProjects: SkillProjects = {
  Python: [
    { name: "VirtualAssistant" },
    { name: "SpeakToGpt" },
    { name: "BankManagement-Python" },
    { name: "DjangoSessionAuthentication" },
    { name: "DataVisualizer" },
    { name: "Tkinter-Programs" },
    { name: "FirstDjangoProject" },
    { name: "PySerialTry" },
    { name: "PixelToRem" },
    { name: "DeleteCopiedFiles" },
    { name: "PythonAutomation" },
    { name: "GithubViewsCounter" },
  ],
  TypeScript: [
    { name: "PizzaTheatre" },
    { name: "Simplicity" },
    { name: "BioSignal-Recorder-Web" },
    { name: "OnlineResume" },
    { name: "Virtual-Mentor-EY" },
  ],
  "Next.js": [
    { name: "BioSignal-Recorder-Web" },
    { name: "Simplicity" },
    { name: "PizzaTheatre" },
    { name: "OnlineResume" },
    { name: "Virtual-Mentor-EY" },
  ],
  Django: [
    { name: "VirtualAssistant" },
    { name: "DjangoSessionAuthentication" },
    { name: "DjangoUserJWT" },
    { name: "MySky" },
    { name: "UserAuth" },
    { name: "FirstDjangoAssignment" },
    { name: "FirstDjangoProject" },
  ],
  "React.js": [
    { name: "ML_Automation_Frontend" },
    { name: "VirtualAssistant" },
  ],
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
    { name: "Deepesh-Portfolio" },
    { name: "chrome_personalization" },
    { name: "HappyBirthday" },
    { name: "KeepItSimple" },
    { name: "Page_404" },
    { name: "Django" },
  ],
};

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

const ProjectCard: React.FC<ProjectInfo> = ({ name }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="w-full bg-card text-card-foreground rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105"
  >
    <Link
      href={`https://github.com/akadeepesh/${name}`}
      target="_blank"
      className="block p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{name}</h3>
        <Github className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">View on GitHub</p>
    </Link>
  </motion.div>
);

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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

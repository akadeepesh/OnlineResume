import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import { BackgroundBeamsWithCollision } from "./ui/background-beams-with-collision";
import { X } from "lucide-react";

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
    { name: "BioSignal-Recorder-Web" },
    { name: "OnlineResume" },
    { name: "Simplicity" },
  ],
  "Next.js": [
    { name: "BioSignal-Recorder-Web" },
    { name: "Simplicity" },
    { name: "PizzaTheatre" },
    { name: "OnlineResume" },
  ],
  Django: [],
  "React.js": [],
  WordPress: [],
  JavaScript: [
    { name: "quizify" },
    { name: "MySky" },
    { name: "ML_Automation_Frontend" },
    { name: "DataVisualizationWeb" },
    { name: "VirtualAssistant" },
    { name: "DjangoAuth" },
    { name: "VirtualMentor" },
  ],
  SQL: [],
  "C/C++": [],
  "HTML/CSS": [
    { name: "Deepesh-Portfolio" },
    { name: "chrome_personalization" },
    { name: "HappyBirthday" },
    { name: "KeepItSimple" },
    { name: "Page_404" },
    { name: "Django" },
  ],
};

const ProjectCard: React.FC<ProjectInfo> = ({ name }) => (
  <div className="my-4 w-full max-w-[400px]">
    <Link href={`https://github.com/akadeepesh/${name}`} target="_blank">
      <img
        src={`https://gh-card.dev/repos/akadeepesh/${name}.svg`}
        alt={`${name} Repository`}
        className="w-full"
      />
    </Link>
  </div>
);

interface SkillDialogProps {
  skill: Skill;
}

const gradientTextClass =
  "bg-clip-text bg-no-repeat text-transparent bg-gradient-to-r py-4 from-purple-500 via-violet-500 to-pink-500 [text-shadow:0_0_rgba(0,0,0,0.1)]";

const SkillDialog: React.FC<SkillDialogProps> = ({ skill }) => (
  <Dialog>
    <DialogTrigger asChild>
      <Badge className="cursor-pointer hover:bg-blue-400" variant="secondary">
        {skill}
      </Badge>
    </DialogTrigger>
    <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
      <div className="relative w-full h-full">
        <BackgroundBeamsWithCollision>
          <div className="relative z-10 p-6">
            <DialogHeader className="mb-4">
              <DialogTitle
                className={`text-2xl font-bold ${gradientTextClass}`}
              >
                {skill} Projects
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4 flex flex-col items-center -mt-4">
                {skillProjects[skill].length > 0 ? (
                  skillProjects[skill].map((project, index) => (
                    <ProjectCard key={index} {...project} />
                  ))
                ) : (
                  <p className={gradientTextClass}>
                    {skill.includes("WordPress")
                      ? "No projects available for this skill yet."
                      : "hehe"}
                  </p>
                )}
              </div>
              <ScrollBar className={`${gradientTextClass}`} />
            </ScrollArea>
          </div>
        </BackgroundBeamsWithCollision>
      </div>
    </DialogContent>
  </Dialog>
);

const SkillsAndProjects: React.FC = () => {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Skills</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {Object.keys(skillProjects).map((skill) => (
            <SkillDialog key={skill} skill={skill as Skill} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillsAndProjects;

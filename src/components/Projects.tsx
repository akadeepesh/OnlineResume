import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Github, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Project {
  name: string;
  description: string;
  github: string;
  demo?: string;
  details: string[];
  technologies: string[];
}

const projects: Project[] = [
  {
    name: "Simplicity",
    description: "Poetry Platform | April 2024 | Personal Project",
    github: "https://github.com/jon/Simplicity",
    demo: "https://simplicity-poetries.vercel.app/",
    details: [
      "Built a user-friendly platform for discovering and sharing poetry, featuring content creation, liking, and community features.",
      "Implemented secure user management, allowing users to control their poems, interact with content, and report issues.",
      "Developed robust filtering options, empowering users to navigate poems based on author, title, content, date, and popularity.",
    ],
    technologies: [
      "Next.js",
      "TypeScript",
      "Convex dev",
      "Shadcn Ui",
      "Aceternity UI",
    ],
  },
  {
    name: "PizzaTheatre",
    description: "E-commerce Platform | December 2023 | Personal Project",
    github: "https://github.com/john/PizzaTheatre",
    demo: "https://pizza-theater.vercel.app/",
    details: [
      "Created a dynamic online pizza ordering system, enabling users to customize orders, manage their cart, and complete purchases.",
      "Built a comprehensive admin dashboard for managing pizza offerings, tracking orders, and providing exceptional customer service.",
    ],
    technologies: [
      "Next.js",
      "TypeScript",
      "Convex dev",
      "Shadcn Ui",
      "Aceternity UI",
    ],
  },
  {
    name: "Personal Voice Assistant",
    description: "Python & AI Project | October 2022 | Personal Project",
    github: "https://github.com/john/VirtualAssistant",
    details: [
      "Developed a responsive voice assistant using Python, Django, and React.js, enabling users to control various tasks through speech commands.",
      "Integrated GPT4ALL for advanced natural language understanding, allowing the assistant to handle complex requests and provide intelligent responses.",
    ],
    technologies: ["Python", "Django", "React", "GPT4ALL"],
  },
  {
    name: "Python Automation Projects",
    description: "Automation Tools | July 2023 | Personal Projects",
    github: "https://github.com/john/",
    details: [
      "Developed a suite of Python automation tools, including grammar correction, playlist management, news aggregation, and web search automation.",
    ],
    technologies: ["Python", "BeautifulSoup", "Gingerit", "Spotipy"],
  },
];

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold text-primary mb-2">
              {project.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {project.description}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" asChild>
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
              >
                <Github className="h-4 w-4" />
              </a>
            </Button>
            {project.demo && (
              <Button variant="outline" size="icon" asChild>
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Live Demo"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {project.technologies.map((tech, index) => (
            <Badge key={index} variant="secondary">
              {tech}
            </Badge>
          ))}
        </div>
        <ul className="list-disc pl-5 space-y-2">
          {project.details.map((detail, index) => (
            <li key={index} className="text-sm">
              {detail}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

const Projects: React.FC = () => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>
          <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {projects.map((project, index) => (
            <React.Fragment key={project.name}>
              <ProjectCard project={project} />
              {index < projects.length - 1 && <Separator className="my-6" />}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Projects;

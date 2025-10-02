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

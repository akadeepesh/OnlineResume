import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const projects = [
  {
    name: "Simplicity",
    description: "Poetry Platform | April 2024 | Personal Project",
    github: "https://github.com/akadeepesh/Simplicity",
    demo: "https://simplicity-poetries.vercel.app/",
    details: [
      "Built a user-friendly platform for discovering and sharing poetry, featuring content creation, liking, and community features.",
      "Implemented secure user management, allowing users to control their poems, interact with content, and report issues.",
      "Developed robust filtering options, empowering users to navigate poems based on author, title, content, date, and popularity.",
    ],
  },
  {
    name: "PizzaTheatre",
    description: "E-commerce Platform | December 2023 | Personal Project",
    github: "https://github.com/akadeepesh/PizzaTheatre",
    demo: "https://pizza-theater.vercel.app/",
    details: [
      "Created a dynamic online pizza ordering system, enabling users to customize orders, manage their cart, and complete purchases.",
      "Built a comprehensive admin dashboard for managing pizza offerings, tracking orders, and providing exceptional customer service.",
    ],
  },
  {
    name: "Personal Voice Assistant",
    description: "Python & AI Project | October 2022 | Personal Project",
    github: "https://github.com/akadeepesh/VirtualAssistant",
    details: [
      "Developed a responsive voice assistant using Python, Django, and React.js, enabling users to control various tasks through speech commands.",
      "Integrated GPT4ALL for advanced natural language understanding, allowing the assistant to handle complex requests and provide intelligent responses.",
    ],
  },
  {
    name: "Python Automation Projects",
    description: "Automation Tools | July 2023 | Personal Projects",
    github: "https://github.com/akadeepesh/",
    details: [
      "Developed a suite of Python automation tools, including grammar correction, playlist management, news aggregation, and web search automation.",
    ],
  },
];

const Projects: React.FC = () => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>
          <h2 className="text-3xl font-semibold tracking-tight">Projects</h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {projects.map((project, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-2xl font-semibold tracking-tight">
                  {project.name}
                </h3>
                <div className="flex space-x-4">
                  <Link
                    href={project.github}
                    className="text-blue-500 hover:text-blue-600"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub
                  </Link>
                  {project.demo && (
                    <Link
                      href={project.demo}
                      className="text-blue-500 hover:text-blue-600"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Live Demo
                    </Link>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {project.description}
              </p>
              <ul className="list-disc pl-5 space-y-2">
                {project.details.map((detail, detailIndex) => (
                  <li key={detailIndex}>{detail}</li>
                ))}
              </ul>
              {index < projects.length - 1 && <Separator className="my-6" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Projects;

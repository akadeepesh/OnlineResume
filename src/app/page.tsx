import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  EnvelopeOpenIcon,
  GitHubLogoIcon,
  LinkedInLogoIcon,
} from "@radix-ui/react-icons";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import SkillsAndProjects from "@/components/SkillsAndProjects";

const DeCoder: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="sticky top-8">
            <Card className="overflow-hidden">
              <CardHeader className="relative h-48"></CardHeader>
              <CardContent className="text-center -mt-32">
                <Image
                  src="/DeepeshBrandBg.png"
                  width={128}
                  height={128}
                  className="rounded-full border-4 border-background inline-block"
                  alt="Deepesh Kumar"
                />
                <h2 className="mt-4 text-2xl font-bold">Deepesh Kumar</h2>
                <p className="text-muted-foreground">
                  Full Stack Web Developer
                </p>
              </CardContent>
              <CardFooter className="flex justify-center space-x-4">
                <Link href="https://github.com/akadeepesh" passHref>
                  <Button size="icon" variant="ghost">
                    <GitHubLogoIcon className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="https://www.linkedin.com/in/akadeepesh/" passHref>
                  <Button size="icon" variant="ghost">
                    <LinkedInLogoIcon className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="mailto:deepesh.kumar.ug21@nsut.ac.in" passHref>
                  <Button size="icon" variant="ghost">
                    <EnvelopeOpenIcon className="h-5 w-5" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <div className="flex flex-col">
              <SkillsAndProjects />
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Tools | DevOps | Database</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "AWS",
                      "Docker",
                      "Git",
                      "GitHub",
                      "Postman",
                      "MySQL",
                      "PostgreSQL",
                      "SQLite",
                      "VS Code",
                      "Pycharm",
                    ].map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Education</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">
                      Netaji Subhas University of Technology
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Bachelor of Technology
                    </p>
                    <p className="text-sm text-muted-foreground">
                      2021 - 2025 (expected)
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      Kendriya Vidyalaya No.2 Delhi Cantt
                    </h3>
                    <p className="text-sm text-muted-foreground">High School</p>
                    <p className="text-sm text-muted-foreground">2019 - 2021</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>
                {" "}
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  About Me
                </h2>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Software developer and final-year student at Netaji Subhas
                University of Technology. Proficient in Python, JavaScript,
                TypeScript, and C/C++, with expertise in backend development
                using Django. Experienced in creating REST APIs, implementing
                authentication systems, and working with databases like MySQL
                and PostgreSQL. Skilled in Full Stack Web Development,
                specializing in Next.js and Backend-as-a-Service (BaaS)
                solutions for JavaScript-based projects.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  Experience
                </h2>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                    Software Development Engineer
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Upside Down Labs | 3 Jun 2024 - 3 Aug 2024 | New Delhi, IN
                  </p>
                  <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                    <li>
                      Developed a full-stack Signal Visualizer web app using
                      Next.js and Django for real-time biopotential signal
                      analysis (EMG, ECG, EEG and EOG).
                    </li>
                    <li>
                      Implemented WebSocket communication, Serial port
                      connection and automatic port detection via pyserial.
                    </li>
                    <li>
                      Created advanced features including multi-channel
                      real-time plotting, FFT analysis, EEG band power
                      visualization, and raw csv data export functionality.
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                    Python Developer
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Brain Intel Corp | 1 Jun 2023 - 31 Jul 2023 | New Delhi, IN
                  </p>
                  <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                    <li>
                      Engineered a neural network model for voice-based emotion
                      detection, achieving 85% accuracy using CNN and transfer
                      learning techniques.
                    </li>
                    <li>
                      Implemented feature extraction and model training using
                      open-source datasets from Kaggle.
                    </li>
                    <li>
                      Utilized Python ecosystem including Librosa, scikit-learn,
                      Keras, and TensorFlow for efficient development and
                      experimentation.
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  Projects
                </h2>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between">
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                      Simplicity
                    </h3>
                    <div className="flex space-x-4">
                      <Link
                        href="https://github.com/akadeepesh/Simplicity"
                        className="text-blue-500 hover:text-blue-600"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        GitHub
                      </Link>
                      <Link
                        href="https://simplicity-poetries.vercel.app/"
                        className="text-blue-500 hover:text-blue-600"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Live Demo
                      </Link>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Poetry Platform | April 2024 | Personal Project
                  </p>
                  <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                    <li>
                      Built a user-friendly platform for discovering and sharing
                      poetry, featuring content creation, liking, and community
                      features.
                    </li>
                    <li>
                      Implemented secure user management, allowing users to
                      control their poems, interact with content, and report
                      issues.
                    </li>
                    <li>
                      Developed robust filtering options, empowering users to
                      navigate poems based on author, title, content, date, and
                      popularity.
                    </li>
                  </ul>
                </div>
                <div>
                  <div className="flex justify-between">
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                      PizzaTheatre
                    </h3>
                    <div className="flex space-x-4">
                      <Link
                        href="https://github.com/akadeepesh/PizzaTheatre"
                        className="text-blue-500 hover:text-blue-600"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        GitHub
                      </Link>
                      <Link
                        href="https://pizza-theater.vercel.app/"
                        className="text-blue-500 hover:text-blue-600"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Live Demo
                      </Link>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    E-commerce Platform | December 2023 | Personal Project
                  </p>
                  <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                    <li>
                      Created a dynamic online pizza ordering system, enabling
                      users to customize orders, manage their cart, and complete
                      purchases.
                    </li>
                    <li>
                      Built a comprehensive admin dashboard for managing pizza
                      offerings, tracking orders, and providing exceptional
                      customer service.
                    </li>
                  </ul>
                </div>
                <div>
                  <div className="flex justify-between">
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                      Personal Voice Assistant
                    </h3>
                    <Link
                      href="https://github.com/akadeepesh/VirtualAssistant"
                      className="text-blue-500 hover:text-blue-600"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub
                    </Link>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Python & AI Project | October 2022 | Personal Project
                  </p>
                  <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                    <li>
                      Developed a responsive voice assistant using Python,
                      Django, and React.js, enabling users to control various
                      tasks through speech commands.
                    </li>
                    <li>
                      Integrated GPT4ALL for advanced natural language
                      understanding, allowing the assistant to handle complex
                      requests and provide intelligent responses.
                    </li>
                  </ul>
                </div>
                <div>
                  <div className="flex justify-between">
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                      Python Automation Projects
                    </h3>
                    <Link
                      href="https://github.com/akadeepesh/"
                      className="text-blue-500 hover:text-blue-600"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub
                    </Link>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Automation Tools | July 2023 | Personal Projects
                  </p>
                  <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                    <li>
                      Developed a suite of Python automation tools, including
                      grammar correction, playlist management, news aggregation,
                      and web search automation.
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>
                {" "}
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  Certifications
                </h2>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    name: "Python (Basic) Certificate",
                    issuer: "HackerRank",
                    date: "Feb 2022",
                  },
                  {
                    name: "Problem Solving (Basic) Certificate",
                    issuer: "HackerRank",
                    date: "Sep 2022",
                  },
                  {
                    name: "SQL (Basic) Certificate",
                    issuer: "HackerRank",
                    date: "Sep 2022",
                  },
                  {
                    name: "C++ Data Structures and Algorithms",
                    issuer: "DevTown",
                    date: "Oct 2022",
                  },
                  {
                    name: "Microsoft AI Skills Challenge",
                    issuer: "Microsoft",
                    date: "Jan 2024",
                  },
                  {
                    name: "Holopin Badges - HacktoberFest",
                    issuer: "Holopin",
                    date: "Jan 2023",
                  },
                ].map((cert, index) => (
                  <HoverCard key={index}>
                    <HoverCardTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        {cert.name}
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      <div>
                        <h4 className="font-semibold">{cert.name}</h4>
                        <p className="text-sm">{cert.issuer}</p>
                        <p className="text-sm text-muted-foreground">
                          Issued {cert.date}
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DeCoder;

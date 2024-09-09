"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import {
  ExternalLink,
  Award,
  Code,
  Database,
  Brain,
  Cpu,
  Globe,
  Trophy,
} from "lucide-react";

const certifications = [
  {
    name: "Python (Basic)",
    issuer: "HackerRank",
    date: "Feb 2022",
    link: "https://hackerrank.com/certificates/a63c9ae3221c",
    icon: <Code className="h-6 w-6" />,
    description:
      "Demonstrated proficiency in Python fundamentals, including data types, control structures, and basic problem-solving skills.",
  },
  {
    name: "C/C++",
    issuer: "Aptech Learning",
    date: "Feb 2022",
    link: "https://drive.google.com/file/d/1JNIzerF8RnVqeDKMz-Lc4X7cUU9l_9YE/view?usp=sharing",
    icon: <Cpu className="h-6 w-6" />,
    description:
      "Mastered core concepts of C and C++ programming, including memory management, object-oriented programming, and standard libraries.",
  },
  {
    name: "Problem Solving (Basic)",
    issuer: "HackerRank",
    date: "Sep 2022",
    link: "https://www.hackerrank.com/certificates/771a2eef8697",
    icon: <Brain className="h-6 w-6" />,
    description:
      "Developed strong analytical and algorithmic thinking skills to solve a variety of coding challenges efficiently.",
  },
  {
    name: "C++ DSA",
    issuer: "DevTown",
    date: "Oct 2022",
    link: "https://cert.devtown.in/verify/Z2tARCS",
    icon: <Code className="h-6 w-6" />,
    description:
      "Advanced understanding of Data Structures and Algorithms implementation in C++, enhancing problem-solving capabilities.",
  },
  {
    name: "Hopin Badge",
    issuer: "Hopin",
    date: "Jan 2023",
    link: "https://www.holopin.me/akadeepesh",
    icon: <Trophy className="h-6 w-6" />,
    description:
      "Earned the Hopin Badge for outstanding performance in Hacktoberfest 2023, finishing globally 11th. This achievement demonstrates exceptional contribution to open-source projects and collaboration within the developer community.",
  },
  {
    name: "SQL (Basic)",
    issuer: "HackerRank",
    date: "Feb 2023",
    link: "https://www.hackerrank.com/certificates/8e579853d4fc",
    icon: <Database className="h-6 w-6" />,
    description:
      "Acquired fundamental SQL skills for database querying, including SELECT statements, filtering, and basic joins.",
  },
  {
    name: "Microsoft AI Skills Challenge",
    issuer: "Microsoft",
    date: "Jan 2024",
    link: "https://drive.google.com/file/d/1oUvEqEbVNdgr-oCm4iSio79ia3QwLNwE/view?usp=sharing",
    icon: <Brain className="h-6 w-6" />,
    description:
      "Explored cutting-edge AI technologies and their practical applications in solving real-world problems.",
  },
  {
    name: "Microsoft Learn Student Ambassador",
    issuer: "Microsoft Azure",
    date: "Mar 2024",
    link: "#",
    icon: <Globe className="h-6 w-6" />,
    description:
      "Recognized for leadership in promoting Microsoft technologies and fostering a learning community on campus.",
  },
  {
    name: "Microsoft Learn Student Ambassador",
    issuer: "Microsoft",
    date: "Mar 2024",
    link: "#",
    icon: <Globe className="h-6 w-6" />,
    description:
      "Demonstrated expertise in Microsoft technologies and commitment to sharing knowledge with peers.",
  },
  {
    name: "Postman API Fundamentals Student Expert",
    issuer: "Postman",
    date: "Aug 2024",
    link: "https://api.badgr.io/public/assertions/9uMjWCCnTDeEwh3-nlfTHA?identity__email=deepesh.kumar.ug21%40nsut.ac.in",
    icon: <Code className="h-6 w-6" />,
    description:
      "Mastered API testing and development using Postman, showcasing proficiency in API workflows and documentation.",
  },
];

export default function Certificates() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-3xl font-bold tracking-tight flex items-center">
          <Award className="mr-2 h-8 w-8 text-primary" />
          Certifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {certifications.map((cert, index) => (
            <HoverCard key={index} openDelay={100} closeDelay={100}>
              <HoverCardTrigger asChild>
                <Card className="overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer">
                  <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                    <div className="text-primary mb-2">{cert.icon}</div>
                    <h3 className="font-medium text-center text-sm">
                      {cert.name}
                    </h3>
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {cert.issuer}
                    </Badge>
                  </CardContent>
                </Card>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 p-0 shadow-lg">
                <div className="bg-primary text-primary-foreground p-4">
                  <h3 className="text-lg font-semibold mb-1">{cert.name}</h3>
                  <p className="text-sm opacity-90">{cert.issuer}</p>
                </div>
                <div className="p-4">
                  <Badge variant="outline" className="mb-2">
                    {cert.date}
                  </Badge>
                  <p className="text-sm text-muted-foreground mb-4">
                    {cert.description}
                  </p>
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full justify-center"
                    asChild
                  >
                    <a
                      href={cert.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center"
                    >
                      View Certificate
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

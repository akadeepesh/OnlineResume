"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ExternalLink,
  Award,
  Code,
  Database,
  Brain,
  Cpu,
  Globe,
  Trophy,
  X,
} from "lucide-react";

interface Certification {
  name: string;
  issuer: string;
  date: string;
  link: string;
  icon: JSX.Element;
  description: string;
}

const certifications: Certification[] = [
  {
    name: "Python (Basic)",
    issuer: "HackerRank",
    date: "Feb 2022",
    link: "https://example.com/certificate",
    icon: <Code className="h-6 w-6" />,
    description:
      "Demonstrated proficiency in Python fundamentals, including data types, control structures, and basic problem-solving skills.",
  },
  {
    name: "C/C++",
    issuer: "Aptech Learning",
    date: "Feb 2022",
    link: "https://example.com/certificate",
    icon: <Cpu className="h-6 w-6" />,
    description:
      "Mastered core concepts of C and C++ programming, including memory management, object-oriented programming, and standard libraries.",
  },
  {
    name: "Problem Solving (Basic)",
    issuer: "HackerRank",
    date: "Sep 2022",
    link: "https://example.com/certificate",
    icon: <Brain className="h-6 w-6" />,
    description:
      "Developed strong analytical and algorithmic thinking skills to solve a variety of coding challenges efficiently.",
  },
  {
    name: "C++ DSA",
    issuer: "DevTown",
    date: "Oct 2022",
    link: "https://example.com/certificate",
    icon: <Code className="h-6 w-6" />,
    description:
      "Advanced understanding of Data Structures and Algorithms implementation in C++, enhancing problem-solving capabilities.",
  },
  {
    name: "Hopin Badge",
    issuer: "Hopin",
    date: "Jan 2023",
    link: "https://example.com/certificate",
    icon: <Trophy className="h-6 w-6" />,
    description:
      "Earned the Hopin Badge for outstanding performance in Hacktoberfest 2023, finishing globally 11th. This achievement demonstrates exceptional contribution to open-source projects and collaboration within the developer community.",
  },
  {
    name: "SQL (Basic)",
    issuer: "HackerRank",
    date: "Feb 2023",
    link: "https://example.com/certificate",
    icon: <Database className="h-6 w-6" />,
    description:
      "Acquired fundamental SQL skills for database querying, including SELECT statements, filtering, and basic joins.",
  },
  {
    name: "Microsoft AI Skills Challenge",
    issuer: "Microsoft",
    date: "Jan 2024",
    link: "https://example.com/certificate",
    icon: <Brain className="h-6 w-6" />,
    description:
      "Explored cutting-edge AI technologies and their practical applications in solving real-world problems.",
  },
  {
    name: "Microsoft Learn Student Ambassador",
    issuer: "Microsoft Azure",
    date: "Mar 2024",
    link: "https://example.com/certificate",
    icon: <Globe className="h-6 w-6" />,
    description:
      "Recognized for leadership in promoting Microsoft technologies and fostering a learning community on campus.",
  },
  {
    name: "Microsoft Learn Student Ambassador",
    issuer: "Microsoft",
    date: "Mar 2024",
    link: "https://example.com/certificate",
    icon: <Globe className="h-6 w-6" />,
    description:
      "Demonstrated expertise in Microsoft technologies and commitment to sharing knowledge with peers.",
  },
  {
    name: "Postman API Fundamentals Student Expert",
    issuer: "Postman",
    date: "Aug 2024",
    link: "https://example.com/certificate",
    icon: <Code className="h-6 w-6" />,
    description:
      "Mastered API testing and development using Postman, showcasing proficiency in API workflows and documentation.",
  },
];

interface CertificateCardProps {
  cert: Certification;
  isMobile: boolean;
}

const CertificateCard: React.FC<CertificateCardProps> = ({
  cert,
  isMobile,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const content = (
    <>
      <div className={isMobile ? "bg-primary text-primary-foreground p-4" : ""}>
        <h3 className="text-lg font-semibold mb-1">{cert.name}</h3>
        <p className="text-sm opacity-90">{cert.issuer}</p>
      </div>
      <div className={isMobile ? "p-4" : ""}>
        <Badge variant="outline" className="mb-2">
          {cert.date}
        </Badge>
        <p className="text-sm text-muted-foreground mb-4">{cert.description}</p>
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
    </>
  );

  return isMobile ? (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer">
          <CardContent className="p-4 flex flex-col items-center justify-center h-full">
            <div className="text-primary mb-2">{cert.icon}</div>
            <h3 className="font-medium text-center text-sm">{cert.name}</h3>
            <Badge variant="secondary" className="mt-2 text-xs">
              {cert.issuer}
            </Badge>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="w-[90%] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Certificate Details
          </DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  ) : (
    <HoverCard openDelay={100} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer">
          <CardContent className="p-4 flex flex-col items-center justify-center h-full">
            <div className="text-primary mb-2">{cert.icon}</div>
            <h3 className="font-medium text-center text-sm">{cert.name}</h3>
            <Badge variant="secondary" className="mt-2 text-xs">
              {cert.issuer}
            </Badge>
          </CardContent>
        </Card>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-6 rounded-2xl shadow-lg">
        {content}
      </HoverCardContent>
    </HoverCard>
  );
};

const Certificates: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
            <CertificateCard key={index} cert={cert} isMobile={isMobile} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Certificates;

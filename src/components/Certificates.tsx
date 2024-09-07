"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const certifications = [
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
  { name: "SQL (Basic) Certificate", issuer: "HackerRank", date: "Sep 2022" },
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
];

const Certificates: React.FC = () => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>
          <h2 className="text-3xl font-semibold tracking-tight">
            Certifications
          </h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {certifications.map((cert, index) => (
            <HoverCard key={index}>
              <HoverCardTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
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
  );
};

export default Certificates;

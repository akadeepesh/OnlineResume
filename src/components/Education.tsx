import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpen, MapPin, Calendar } from "lucide-react";

interface EducationEntry {
  institution: string;
  degree: string;
  period: string;
  location: string;
  achievements?: string[];
  relevantCourses?: string[];
}

const educationData: EducationEntry[] = [
  {
    institution: "Netaji Subhas University of Technology",
    degree: "Bachelor of Technology",
    period: "2021 - 2025 (expected)",
    location: "Delhi, India",
  },
  {
    institution: "Kendriya Vidyalaya No.2 Delhi Cantt",
    degree: "High School",
    period: "2019 - 2021",
    location: "Delhi, India",
  },
];

const EducationEntry: React.FC<{ entry: EducationEntry }> = ({ entry }) => (
  <div className="space-y-2">
    <h3 className="text-xl font-bold text-primary">{entry.institution}</h3>
    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
      <BookOpen className="h-4 w-4" />
      <span>{entry.degree}</span>
    </div>
    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
      <Calendar className="h-4 w-4" />
      <span>{entry.period}</span>
    </div>
    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
      <MapPin className="h-4 w-4" />
      <span>{entry.location}</span>
    </div>
  </div>
);

const Education: React.FC = () => {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">
          Education
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {educationData.map((entry, index) => (
            <React.Fragment key={index}>
              <EducationEntry entry={entry} />
              {index < educationData.length - 1 && (
                <Separator className="my-4" />
              )}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Education;

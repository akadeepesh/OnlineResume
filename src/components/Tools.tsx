import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SkillCategory {
  name: string;
  skills: string[];
}

const skillCategories: SkillCategory[] = [
  {
    name: "Cloud & BaaS",
    skills: ["AWS", "Firebase", "Vercel", "Supabase", "Convex dev"],
  },
  {
    name: "Development Tools",
    skills: ["VS Code", "PyCharm", "Jupyter", "Sublime Text", "Postman"],
  },
  {
    name: "DevOps & Version Control",
    skills: ["Docker", "Git", "GitHub"],
  },
  {
    name: "Operating Systems",
    skills: ["Windows", "Ubuntu", "Fedora"],
  },
];

const TechnicalSkills: React.FC = () => {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">
          Technical Expertise & Tools
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {skillCategories.map((category) => (
            <div key={category.name} className="space-y-2">
              <h3 className="text-lg font-semibold text-muted-foreground">
                {category.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="text-xs py-1 px-2"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TechnicalSkills;

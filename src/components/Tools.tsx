import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const tools = [
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
];

const Tools: React.FC = () => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Tools | DevOps | Database</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {tools.map((tool) => (
            <Badge key={tool} variant="secondary">
              {tool}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Tools;

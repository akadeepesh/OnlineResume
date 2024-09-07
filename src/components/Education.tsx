import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Education: React.FC = () => {
  return (
    <Card className="shadow-md">
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
          <Separator />
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
  );
};

export default Education;

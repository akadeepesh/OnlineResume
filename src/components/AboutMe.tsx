import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AboutMe = () => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>
          <h2 className="text-3xl font-semibold tracking-tight">About Me</h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg leading-relaxed">
          Software developer and final-year student at Netaji Subhas University
          of Technology. Proficient in Python, JavaScript, TypeScript, and
          C/C++, with expertise in backend development using Django. Experienced
          in creating REST APIs, implementing authentication systems, and
          working with databases like MySQL and PostgreSQL. Skilled in Full
          Stack Web Development, specializing in Next.js and
          Backend-as-a-Service (BaaS) solutions for JavaScript-based projects.
        </p>
      </CardContent>
    </Card>
  );
};

export default AboutMe;

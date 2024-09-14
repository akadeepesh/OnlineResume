import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutMe() {
  return (
    <Card className="bg-white shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold text-gray-800">
          About Me
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-base text-gray-700 leading-relaxed">
          <span className="font-semibold">Software developer</span> and
          final-year student at Netaji Subhas University of Technology.
          Proficient in{" "}
          <span className="font-semibold">
            Python, JavaScript, TypeScript, and C/C++
          </span>
          , with expertise in
          <span className="font-semibold">
            {" "}
            backend development using Django
          </span>
          . Experienced in creating
          <span className="font-semibold"> REST APIs</span>, implementing{" "}
          <span className="font-semibold">
            authentication systems & authorisation flows
          </span>
          , and working with databases like{" "}
          <span className="font-semibold">MySQL and PostgreSQL</span>. Skilled
          in
          <span className="font-semibold"> Full Stack Web Development</span>,
          specializing in
          <span className="font-semibold"> Next.js</span> and{" "}
          <span className="font-semibold">Backend-as-a-Service (BaaS)</span>{" "}
          solutions for JavaScript-based projects.
        </p>
      </CardContent>
    </Card>
  );
}

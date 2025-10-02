import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";

interface ExperienceItemProps {
  title: string;
  company: string;
  date: string;
  location: string;
  responsibilities: string[];
  skills: string[];
}

const ExperienceItem: React.FC<ExperienceItemProps> = ({
  title,
  company,
  date,
  location,
  responsibilities,
  skills,
}) => (
  <div className="space-y-4">
    <div>
      <h3 className="text-2xl font-bold tracking-tight text-primary">
        {title}
      </h3>
      <p className="text-lg font-semibold text-muted-foreground">{company}</p>
      <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
        <Calendar className="h-4 w-4" />
        <span>{date}</span>
        <MapPin className="h-4 w-4 ml-2" />
        <span>{location}</span>
      </div>
    </div>
    <ul className="list-disc pl-5 space-y-2 text-base">
      {responsibilities.map((resp, index) => (
        <li key={index}>{resp}</li>
      ))}
    </ul>
    <div className="flex flex-wrap gap-2 mt-3">
      {skills.map((skill, index) => (
        <Badge key={index} variant="secondary">
          {skill}
        </Badge>
      ))}
    </div>
  </div>
);

interface Experience {
  title: string;
  company: string;
  date: string;
  location: string;
  responsibilities: string[];
  skills: string[];
}

const Experience: React.FC = () => {
  const experiences: Experience[] = [
    {
      title: "Software Engineer at Tech Solutions Inc.",
      company: "Tech Solutions Inc.",
      date: "Jan 2022 - Present",
      location: "San Francisco, CA",
      responsibilities: [
        "Developed and maintained scalable web applications using modern JavaScript frameworks.",
        "Collaborated with cross-functional teams to define, design, and ship new features.",
        "Participated in code reviews and contributed to improving code quality and team best practices.",
      ],
      skills: ["JavaScript", "React", "Node.js", "AWS", "Docker"],
    },
    {
      title: "Marketing Specialist at Global Innovations",
      company: "Global Innovations",
      date: "Jun 2020 - Dec 2021",
      location: "New York, NY",
      responsibilities: [
        "Managed digital marketing campaigns across various platforms, increasing lead generation by 20%.",
        "Analyzed market trends and customer behavior to optimize marketing strategies.",
        "Created engaging content for social media, email newsletters, and company blogs.",
      ],
      skills: [
        "Digital Marketing",
        "SEO",
        "Content Creation",
        "Google Analytics",
        "Social Media",
      ],
    },
    {
      title: "Data Analyst Intern at Data Insights Co.",
      company: "Data Insights Co.",
      date: "May 2019 - Aug 2019",
      location: "Boston, MA",
      responsibilities: [
        "Assisted in collecting, cleaning, and analyzing large datasets to identify key trends.",
        "Prepared reports and visualizations to present findings to senior analysts.",
        "Gained hands-on experience with SQL and various data visualization tools.",
      ],
      skills: [
        "SQL",
        "Excel",
        "Data Visualization",
        "Python (Pandas)",
        "Statistical Analysis",
      ],
    },
  ];

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle>
          <h2 className="text-3xl font-bold tracking-tight">Experience</h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {experiences.map((exp, index) => (
            <React.Fragment key={index}>
              <ExperienceItem {...exp} />
              {index < experiences.length - 1 && <Separator className="my-8" />}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Experience;

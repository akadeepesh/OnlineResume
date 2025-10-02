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
      title: "Software Development Engineer",
      company: "Upside Down Labs",
      date: "3 Jun 2024 - 3 Aug 2024",
      location: "SA, USA",
      responsibilities: [
        "Developed a full-stack Signal Visualizer web app using Next.js and Django for real-time biopotential signal analysis (EMG, ECG, EEG and EOG).",
        "Implemented WebSocket communication, Serial port connection and automatic port detection via pyserial.",
        "Created advanced features including multi-channel real-time plotting, FFT analysis, EEG band power visualization, and raw csv data export functionality.",
      ],
      skills: [
        "Next.js",
        "Django",
        "WebSocket",
        "Django Channels",
        "Signal Processing",
        "Data Visualization",
      ],
    },
    {
      title: "Python Developer",
      company: "MFTS Corp",
      date: "1 Jun 2023 - 31 Jul 2023",
      location: "Seattle",
      responsibilities: [
        "Engineered a neural network model for voice-based emotion detection, achieving 85% accuracy using CNN and transfer learning techniques.",
        "Implemented feature extraction and model training using open-source datasets from Kaggle.",
        "Utilized Python ecosystem including Librosa, scikit-learn, Keras, and TensorFlow for efficient development and experimentation.",
      ],
      skills: ["Python", "Machine Learning", "CNN", "TensorFlow", "Keras"],
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

import ProfileCard from "@/components/ProfileCard";
import AboutMe from "@/components/AboutMe";
import Experience from "@/components/Experience";
import SkillsAndProjects from "@/components/SkillsAndProjects";
import Certificates from "@/components/Certificates";
import Projects from "@/components/Projects";
import Education from "@/components/Education";
import Tools from "@/components/Tools";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b bg-brand">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-8">
              <ProfileCard />
              <SkillsAndProjects />
              <Tools />
              <Education />
            </div>
          </div>
          <div className="lg:col-span-2 space-y-8">
            <AboutMe />
            <Experience />
            <Projects />
            <Certificates />
          </div>
        </div>
      </div>
    </div>
  );
}

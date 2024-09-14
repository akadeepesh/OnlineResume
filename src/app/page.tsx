import React from "react";
import ProfileCard from "@/components/ProfileCard";
import AboutMe from "@/components/AboutMe";
import Experience from "@/components/Experience";
import SkillsAndProjects from "@/components/SkillsAndProjects";
import Certificates from "@/components/Certificates";
import Projects from "@/components/Projects";
import Education from "@/components/Education";
import Tools from "@/components/Tools";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b bg-brand">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column for desktop - sticky sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-8 space-y-8">
              <ProfileCard />
              <SkillsAndProjects />
              <Tools />
              <Education />
            </div>
          </div>

          {/* Main content area */}
          <div className="lg:col-span-2">
            {/* Mobile-only ProfileCard */}
            <div className="lg:hidden mb-8">
              <ProfileCard />
            </div>

            {/* Main content wrapper with consistent spacing */}
            <div className="space-y-8">
              {/* AboutMe - always first in main content */}
              <AboutMe />

              {/* Mobile-only SkillsAndProjects */}
              <div className="lg:hidden">
                <SkillsAndProjects />
              </div>

              {/* Mobile-only Tools */}
              <div className="lg:hidden">
                <Tools />
              </div>

              {/* Experience */}
              <Experience />

              {/* Projects */}
              <Projects />

              {/* Mobile-only Education */}
              <div className="lg:hidden">
                <Education />
              </div>

              {/* Certificates */}
              <Certificates />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

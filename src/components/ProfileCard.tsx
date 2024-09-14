"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  GitHubLogoIcon,
  LinkedInLogoIcon,
  EnvelopeOpenIcon,
  DownloadIcon,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";

const ProfileCard: React.FC = () => {
  const handleDownloadResume = () => {
    const resumeUrl = "/Deepesh_Kumar_Resume.pdf";

    const link = document.createElement("a");
    link.href = resumeUrl;
    link.setAttribute("download", "Deepesh_Kumar_Resume.pdf");

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-3xl">
      <div className="relative h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white dark:from-gray-800"></div>
      </div>
      <div className="relative px-6 pb-6">
        <div className="flex flex-col items-center -mt-20">
          <Image
            src="/DeepeshBrandBg.png"
            width={140}
            height={140}
            className="rounded-full border-4 border-white dark:border-gray-800 shadow-lg"
            alt="Deepesh Kumar"
          />
          <h2 className="mt-4 text-3xl font-bold text-gray-800 dark:text-white">
            Deepesh Kumar
          </h2>
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            Full Stack Web Developer
          </p>
          <div className="mt-4 flex space-x-3">
            <Link href="https://github.com/akadeepesh" passHref>
              <Button size="sm" variant="outline" className="rounded-full">
                <GitHubLogoIcon className="h-4 w-4 mr-2" />
                GitHub
              </Button>
            </Link>
            <Link href="https://www.linkedin.com/in/akadeepesh/" passHref>
              <Button size="sm" variant="outline" className="rounded-full">
                <LinkedInLogoIcon className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
            </Link>
            <Link href="mailto:deepesh.kumar.ug21@nsut.ac.in" passHref>
              <Button size="sm" variant="outline" className="rounded-full">
                <EnvelopeOpenIcon className="h-4 w-4 mr-2" />
                Email
              </Button>
            </Link>
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Open Source Software Developer. Final year at Netaji Subhas
            University of Technology.
          </p>
          <Button
            className="w-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
            onClick={handleDownloadResume}
          >
            <DownloadIcon className="h-4 w-4 mr-2" />
            Download Resume
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;

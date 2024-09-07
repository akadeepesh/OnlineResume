import Image from "next/image";
import Link from "next/link";
import {
  GitHubLogoIcon,
  LinkedInLogoIcon,
  EnvelopeOpenIcon,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";

const ProfileCard = () => {
  return (
    <div className="bg-gradient-to-b from-blue-500 to-purple-600 rounded-lg overflow-hidden shadow-lg">
      <div className="relative h-48"></div>
      <div className="text-center -mt-24 relative z-10">
        <Image
          src="/DeepeshBrandBg.png"
          width={128}
          height={128}
          className="rounded-full border-4 border-[#424356] inline-block"
          alt="Deepesh Kumar"
        />
        <h2 className="mt-4 text-2xl font-bold text-white">Deepesh Kumar</h2>
        <p className="text-white opacity-75">Full Stack Web Developer</p>
      </div>
      <div className="flex justify-center space-x-4 mt-4 pb-6">
        <Link href="https://github.com/akadeepesh" passHref>
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:text-gray-800"
          >
            <GitHubLogoIcon className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </Button>
        </Link>
        <Link href="https://www.linkedin.com/in/akadeepesh/" passHref>
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:text-gray-800"
          >
            <LinkedInLogoIcon className="h-5 w-5" />
            <span className="sr-only">LinkedIn</span>
          </Button>
        </Link>
        <Link href="mailto:deepesh.kumar.ug21@nsut.ac.in" passHref>
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:text-gray-800"
          >
            <EnvelopeOpenIcon className="h-5 w-5" />
            <span className="sr-only">Email</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ProfileCard;

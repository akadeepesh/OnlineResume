import { ModeToggle } from "@/components/ModeToggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { EnvelopeOpenIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";

const DeCoder = () => {
  return (
    <div className="flex my-20 max-w-screen-lg flex-row items-center mx-10 lg:mx-60 md:mx-40 sm:mx-20">
      <ModeToggle className="fixed right-5 top-5" />
      <div className="flex flex-col gap-10">
        <div className="w-[391.23px]">
          <AspectRatio ratio={384 / 501}>
            <Image
              src="/DeepeshBrandBg.png"
              width={384}
              height={100}
              alt="Image"
              className="rounded-md object-cover"
            />
          </AspectRatio>
        </div>
        <div className="Contact">
          <Card>
            <CardHeader>
              <CardTitle className="font-bold">Contact</CardTitle>
              <CardDescription>New Delhi, India</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <span className="text-muted-foreground text-sm">
                  +91 9876543210
                </span>
                <Button size={"sm"}>
                  <EnvelopeOpenIcon className="mr-2 h-4 w-4" />{" "}
                  <a href="mailto:deepesh.kumar.ug21@nsut.ac.in">Email</a>
                </Button>
                <div className="flex flex-row justify-between items-center gap-3 w-full">
                  <Button className="w-1/2" size={"sm"}>
                    <a href="https://github.com/akadeepesh">GitHub</a>
                  </Button>
                  <Button className="w-1/2" size={"sm"}>
                    <a href="https://www.linkedin.com/in/akadeepesh/">
                      LinkedIn
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="Education">
          <Card>
            <CardHeader>
              <CardTitle className="font-bold">Education</CardTitle>
              <CardDescription>New Delhi, India</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-5">
                <div className="">
                  <div className="text-lg font-semibold">
                    Netaji Subhas University of Technology
                  </div>
                  <div className="text-md">Bachelor of Technology</div>
                  <span className="text-sm text-muted-foreground">
                    2021 - 2025 (expected)
                  </span>
                </div>
                <div className="">
                  <div className="text-lg font-semibold">
                    Kendriya Vidyalaya No.2 Delhi Cantt
                  </div>
                  <div className="text-md">High School</div>
                  <span className="text-sm text-muted-foreground">
                    2019-2021
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className=""></div>
    </div>
  );
};

export default DeCoder;

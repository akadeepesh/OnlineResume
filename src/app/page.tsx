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
import { Separator } from "@/components/ui/separator";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const Github: React.FC<{ className: string }> = ({ className }) => {
  return (
    <div className={className + "flex flex-col gap-5"}>
      <svg viewBox="0 0 438.549 438.549" className="h-1/2 w-1/2">
        <a href="https://github.com/akadeepesh">
          <path
            fill="currentColor"
            d="M409.132 114.573c-19.608-33.596-46.205-60.194-79.798-79.8-33.598-19.607-70.277-29.408-110.063-29.408-39.781 0-76.472 9.804-110.063 29.408-33.596 19.605-60.192 46.204-79.8 79.8C9.803 148.168 0 184.854 0 224.63c0 47.78 13.94 90.745 41.827 128.906 27.884 38.164 63.906 64.572 108.063 79.227 5.14.954 8.945.283 11.419-1.996 2.475-2.282 3.711-5.14 3.711-8.562 0-.571-.049-5.708-.144-15.417a2549.81 2549.81 0 01-.144-25.406l-6.567 1.136c-4.187.767-9.469 1.092-15.846 1-6.374-.089-12.991-.757-19.842-1.999-6.854-1.231-13.229-4.086-19.13-8.559-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-.951-2.568-2.098-3.711-3.429-1.142-1.331-1.997-2.663-2.568-3.997-.572-1.335-.098-2.43 1.427-3.289 1.525-.859 4.281-1.276 8.28-1.276l5.708.853c3.807.763 8.516 3.042 14.133 6.851 5.614 3.806 10.229 8.754 13.846 14.842 4.38 7.806 9.657 13.754 15.846 17.847 6.184 4.093 12.419 6.136 18.699 6.136 6.28 0 11.704-.476 16.274-1.423 4.565-.952 8.848-2.383 12.847-4.285 1.713-12.758 6.377-22.559 13.988-29.41-10.848-1.14-20.601-2.857-29.264-5.14-8.658-2.286-17.605-5.996-26.835-11.14-9.235-5.137-16.896-11.516-22.985-19.126-6.09-7.614-11.088-17.61-14.987-29.979-3.901-12.374-5.852-26.648-5.852-42.826 0-23.035 7.52-42.637 22.557-58.817-7.044-17.318-6.379-36.732 1.997-58.24 5.52-1.715 13.706-.428 24.554 3.853 10.85 4.283 18.794 7.952 23.84 10.994 5.046 3.041 9.089 5.618 12.135 7.708 17.705-4.947 35.976-7.421 54.818-7.421s37.117 2.474 54.823 7.421l10.849-6.849c7.419-4.57 16.18-8.758 26.262-12.565 10.088-3.805 17.802-4.853 23.134-3.138 8.562 21.509 9.325 40.922 2.279 58.24 15.036 16.18 22.559 35.787 22.559 58.817 0 16.178-1.958 30.497-5.853 42.966-3.9 12.471-8.941 22.457-15.125 29.979-6.191 7.521-13.901 13.85-23.131 18.986-9.232 5.14-18.182 8.85-26.84 11.136-8.662 2.286-18.415 4.004-29.263 5.146 9.894 8.562 14.842 22.077 14.842 40.539v60.237c0 3.422 1.19 6.279 3.572 8.562 2.379 2.279 6.136 2.95 11.276 1.995 44.163-14.653 80.185-41.062 108.068-79.226 27.88-38.161 41.825-81.126 41.825-128.906-.01-39.771-9.818-76.454-29.414-110.049z"
          ></path>
        </a>
      </svg>
      <p className="text-muted-foreground">Including private repositories.</p>
    </div>
  );
};

const DeCoder: React.FC = () => {
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
        <div className="Skills">
          <Card>
            <CardHeader>
              <CardTitle className="font-bold">Skills</CardTitle>
              <Separator className="bg-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-row gap-10">
                <div className="flex flex-col gap-2 cursor-default">
                  <HoverCard>
                    <HoverCardTrigger className="w-fit">
                      Python
                    </HoverCardTrigger>
                    <HoverCardContent className="flex flex-row">
                      <Github className="flex justify-center items-center w-full h-full" />
                      <div className="flex flex-row gap-10">
                        <div className="flex flex-col gap-1 justify-center items-start">
                          <a href="https://github.com/akadeepesh/PythonAutomation">
                            PythonAutomation
                          </a>
                          <a href="https://github.com/akadeepesh/DjangoUserJWT">
                            DjangoUserJWT
                          </a>
                          <a href="https://github.com/akadeepesh/ChatWithWebsites">
                            ChatWithWebsites
                          </a>
                          <a href="https://github.com/akadeepesh/DataVisualizer">
                            DataVisualizer
                          </a>
                          <a href="https://github.com/akadeepesh/DjangoSessionAuthentication">
                            DjangoSessionAuthentication
                          </a>
                          <a href="https://github.com/akadeepesh/CollegeAdmissionManagement">
                            CollegeAdmissionManagement
                          </a>
                          <a href="https://github.com/akadeepesh/FirstDjangoProject">
                            FirstDjangoProject
                          </a>
                        </div>
                        <Separator
                          orientation="vertical"
                          className="bg-foreground"
                        />
                        <div className="flex flex-col gap-1 justify-center items-center">
                          <a href="https://github.com/akadeepesh/UserAuth">
                            UserAuth
                          </a>
                          <a href="https://github.com/akadeepesh/PixelToRem">
                            PixelToRem
                          </a>
                          <a href="https://github.com/akadeepesh/BankManagement-Python">
                            BankManagementPython
                          </a>
                          <a href="https://github.com/akadeepesh/DeleteCopiedFiles">
                            DeleteCopiedFiles
                          </a>
                          <a href="https://github.com/akadeepesh/SpeakToGPT">
                            SpeakToGPT
                          </a>
                          <a href="https://github.com/akadeepesh/GithubViewsCounter">
                            GithubViewsCounter
                          </a>
                          <a href="https://github.com/akadeepesh/Tkinter-Programs">
                            TkinterPrograms
                          </a>
                        </div>
                        <Separator
                          orientation="vertical"
                          className="bg-foreground"
                        />
                        <div className="flex flex-col gap-1 justify-center items-end">
                          <a href="https://github.com/akadeepesh/Tkinter-Games">
                            TkinterGames
                          </a>
                          <a href="https://github.com/akadeepesh/Rewards_Auto">
                            RewardsAuto
                          </a>
                          <a href="https://github.com/akadeepesh/News_For_Me">
                            NewsForMe
                          </a>
                          <a href="https://github.com/akadeepesh/Sentence_Correction">
                            SentenceCorrection
                          </a>
                          <a href="https://github.com/akadeepesh/Spotify_Add2playlist">
                            SpotifyAdd2playlist
                          </a>
                          <a href="https://github.com/akadeepesh/Password_manager">
                            Password_manager
                          </a>
                          <a href="https://github.com/akadeepesh/Django_basic">
                            Django_basic
                          </a>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <HoverCard>
                    <HoverCardTrigger className="w-fit">
                      React.js
                    </HoverCardTrigger>
                    <HoverCardContent className="flex flex-row">
                      <Github className="flex justify-center items-center w-full h-full" />
                      <div className="flex flex-col gap-3 justify-center items-end">
                        <a href="https://github.com/akadeepesh/ML_Automation_Frontend">
                          MLAutomationFrontend
                        </a>
                        <a href="https://github.com/akadeepesh/VirtualAssistant">
                          VirtualAssistant
                        </a>
                        <a href="https://github.com/akadeepesh/ReCreating-FirstSite">
                          ReCreatingFirstSite
                        </a>
                        <a href="https://github.com/akadeepesh/FirstViteTried">
                          FirstViteTried
                        </a>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <HoverCard>
                    <HoverCardTrigger className="w-fit">
                      Django
                    </HoverCardTrigger>
                    <HoverCardContent className="flex flex-row">
                      <Github className="flex justify-center items-center w-full h-full" />
                      <div className="flex flex-row gap-10">
                        <div className="flex flex-col gap-1 justify-center items-start">
                          <a href="https://github.com/akadeepesh/DjangoUserJWT">
                            DjangoUserJWT
                          </a>
                          <a href="https://github.com/akadeepesh/Django_basic">
                            Django_basic
                          </a>
                          <a href="https://github.com/akadeepesh/FirstDjangoAssignment">
                            FirstDjangoAssignment
                          </a>
                          <a href="https://github.com/akadeepesh/DjangoAuth">
                            DjangoAuth
                          </a>
                          <a href="https://github.com/akadeepesh/VirtualMentor">
                            VirtualMentor
                          </a>
                        </div>
                        <Separator
                          orientation="vertical"
                          className="bg-foreground"
                        />
                        <div className="flex flex-col gap-1 justify-center items-end">
                          <a href="https://github.com/akadeepesh/DjangoSessionAuthentication">
                            DjangoSessionAuthentication
                          </a>
                          <a href="https://github.com/akadeepesh/Virtual-Mentor-EY">
                            VirtualMentorEY
                          </a>
                          <a href="https://github.com/akadeepesh/UserAuth">
                            UserAuth
                          </a>
                          <a href="https://github.com/akadeepesh/CollegeAdmissionManagement">
                            CollegeAdmissionManagement
                          </a>
                          <a href="https://github.com/akadeepesh/FirstDjangoProject">
                            FirstDjangoProject
                          </a>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <HoverCard>
                    <HoverCardTrigger className="w-fit">
                      Python GUI - Tkinter
                    </HoverCardTrigger>
                    <HoverCardContent className="flex flex-row">
                      <Github className="flex justify-center items-center w-full h-full" />
                      <div className="flex flex-col gap-5 justify-center items-end">
                        <a href="https://github.com/akadeepesh/Tkinter-Games">
                          TkinterGames
                        </a>
                        <a href="https://github.com/akadeepesh/Tkinter-Programs">
                          TkinterPrograms
                        </a>
                        <a href="https://github.com/akadeepesh/BankManagement-Python">
                          BankManagementPython
                        </a>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <HoverCard>
                    <HoverCardTrigger className="w-fit">
                      HTML | CSS
                    </HoverCardTrigger>
                    <HoverCardContent className="flex flex-row">
                      <Github className="flex justify-center items-center w-full h-full" />
                      <div className="flex flex-row gap-10">
                        <div className="flex flex-col gap-1 justify-center items-start">
                          <a href="https://github.com/akadeepesh/VirtualAssistant-1stTry">
                            VirtualAssistant1stTry
                          </a>
                          <a href="https://github.com/akadeepesh/happy-birthday">
                            HappyBirthday
                          </a>
                          <a href="https://github.com/akadeepesh/KeepItSimple">
                            KeepItSimple
                          </a>
                          <a href="https://github.com/akadeepesh/Django">
                            Django
                          </a>
                        </div>
                        <Separator
                          orientation="vertical"
                          className="bg-foreground"
                        />
                        <div className="flex flex-col gap-1 justify-center items-end">
                          <a href="https://github.com/akadeepesh/Page_404">
                            Page404
                          </a>
                          <a href="https://github.com/akadeepesh/deepesh_html">
                            DeepeshHtml
                          </a>
                          <a href="https://github.com/akadeepesh/Deepesh-Portfolio">
                            DeepeshPortfolio
                          </a>
                          <a href="https://github.com/akadeepesh/chrome_personalization">
                            ChromePersonalization
                          </a>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <HoverCard>
                    <HoverCardTrigger className="w-fit">
                      Javascript
                    </HoverCardTrigger>
                    <HoverCardContent className="flex flex-row">
                      <Github className="flex justify-center items-center w-full h-full" />
                      <div className="flex flex-row gap-10">
                        <div className="flex flex-col gap-1 justify-center items-start">
                          <a href="https://github.com/akadeepesh/ML_Automation_Frontend">
                            MLAutomationFrontend
                          </a>
                          <a href="https://github.com/akadeepesh/DataVisualizationWeb">
                            DataVisualizationWeb
                          </a>
                          <a href="https://github.com/akadeepesh/FirstDjangoAssignment">
                            FirstDjangoAssignment
                          </a>
                          <a href="https://github.com/akadeepesh/MySky">
                            MySky
                          </a>
                          <a href="https://github.com/akadeepesh/VirtualAssistant">
                            VirtualAssistant
                          </a>
                        </div>
                        <Separator
                          orientation="vertical"
                          className="bg-foreground"
                        />
                        <div className="flex flex-col gap-1 justify-center items-end">
                          <a href="https://github.com/akadeepesh/VirtualAssistant-1stTry">
                            VirtualAssistant1stTry
                          </a>
                          <a href="https://github.com/akadeepesh/ReCreating-FirstSite">
                            ReCreatingFirstSite
                          </a>
                          <a href="https://github.com/akadeepesh/DjangoAuth">
                            DjangoAuth
                          </a>
                          <a href="https://github.com/akadeepesh/VirtualMentor">
                            VirtualMentor
                          </a>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                <Separator orientation="vertical" className="bg-foreground" />
                <div className="flex flex-col gap-2 cursor-default">
                  <HoverCard>
                    <HoverCardTrigger className="w-fit">
                      Typescript
                    </HoverCardTrigger>
                    <HoverCardContent className="flex flex-row">
                      <Github className="flex justify-center items-center w-full h-full" />
                      <div className="flex flex-col gap-1 justify-center items-end">
                        <a href="https://github.com/akadeepesh/OnlineResume">
                          OnlineResume
                        </a>
                        <a href="https://github.com/akadeepesh/Virtual-Mentor-EY">
                          VirtualMentorEY
                        </a>
                        <a href="https://github.com/akadeepesh/FirstViteTried">
                          FirstViteTried
                        </a>
                        <a href="https://github.com/akadeepesh/MySky">MySky</a>
                        <a href="https://github.com/akadeepesh/data-creation">
                          DataCreation
                        </a>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <HoverCard>
                    <HoverCardTrigger className="w-fit">
                      C | C++
                    </HoverCardTrigger>
                    <HoverCardContent className="flex flex-row">
                      <Github className="flex justify-center items-center w-full h-full" />
                      <div className="flex flex-col justify-center items-end">
                        <a href="https://github.com/akadeepesh/Cpp-DSA">
                          CppDSA
                        </a>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <HoverCard>
                    <HoverCardTrigger className="w-fit">MySQL</HoverCardTrigger>
                    <HoverCardContent className="flex flex-row">
                      <Github className="flex justify-center items-center w-full h-full" />
                      <div className="flex flex-col justify-center items-end">
                        <a href="https://github.com/akadeepesh/BankManagement-Python">
                          BankManagementPython
                        </a>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <HoverCard>
                    <HoverCardTrigger className="w-fit">
                      Next.js
                    </HoverCardTrigger>
                    <HoverCardContent className="flex flex-row">
                      <Github className="flex justify-center items-center w-full h-full" />
                      <div className="flex flex-col gap-5 justify-center items-end">
                        <a href="https://github.com/akadeepesh/OnlineResume">
                          OnlineResume
                        </a>
                        <a href="https://github.com/akadeepesh/MySky">MySky</a>
                        <a href="https://github.com/akadeepesh/Virtual-Mentor-EY">
                          VirtualMentorEY
                        </a>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <HoverCard>
                    <HoverCardTrigger className="w-fit">php</HoverCardTrigger>
                    <HoverCardContent className="flex flex-row">
                      <Github className="flex justify-center items-center w-full h-full" />
                      <div className="flex flex-col justify-center items-end">
                        <a href="https://github.com/akadeepesh/deepesh_html">
                          DeepeshHtml
                        </a>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <HoverCard>
                    <HoverCardTrigger className="w-fit">
                      JQuery
                    </HoverCardTrigger>
                    <HoverCardContent className="flex flex-row">
                      <Github className="flex justify-center items-center w-full h-full" />
                      <div className="flex flex-col justify-center items-end">
                        <a href="https://github.com/akadeepesh/KeepItSimple">
                          KeepItSimple
                        </a>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DeCoder;

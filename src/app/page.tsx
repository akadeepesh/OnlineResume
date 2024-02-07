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

import { EnvelopeOpenIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Label } from "@/components/ui/label";

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
    <div className="flex my-20 max-w-screen-lg flex-col md:flex-row justify-center items-center gap-10 lg:mx-60 md:mx-40">
      <ModeToggle className="fixed right-5 top-5" />
      <div className="Sidebar flex flex-col ml-24 md:ml-0 gap-10">
        <div className="flex justify-center items-center w-[433.6px] sm:w-auto md:w-[391.23px] md:mb-10">
          <div className="flex w-[192px] h-[250px]">
            <Image
              src="/DeepeshBrandBg.png"
              width={192}
              height={250}
              alt="Image"
              className="rounded-full object-cover"
              priority
            />
          </div>
        </div>
        <div className="Contact">
          <Card className="bg-primary-foreground">
            <CardHeader>
              <CardTitle className="font-bold">Contact</CardTitle>
              <CardDescription>New Delhi, India</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <div className="flex flex-row justify-between">
                  <span className="text-muted-foreground text-sm">
                    +91 9876543210
                  </span>
                  <div className="flex felx-row justify-center items-center text-muted-foreground text-sm">
                    <EnvelopeOpenIcon className="mr-2 h-4 w-4" />
                    <a href="mailto:deepesh.kumar.ug21@nsut.ac.in">Email</a>
                  </div>
                </div>
                <Button size={"sm"}>
                  <a
                    href="https://deepesh-portfolio.vercel.app/"
                    target="__blank"
                  >
                    Portfolio
                  </a>
                </Button>

                <div className="flex flex-row justify-between items-center gap-3 w-full">
                  <Button className="w-1/2" size={"sm"}>
                    <a href="https://github.com/akadeepesh" target="__blank">
                      GitHub
                    </a>
                  </Button>
                  <Button className="w-1/2" size={"sm"}>
                    <a
                      href="https://www.linkedin.com/in/akadeepesh/"
                      target="__blank"
                    >
                      LinkedIn
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="Education">
          <Card className="bg-primary-foreground">
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
          <Card className="bg-primary-foreground">
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
                          <a
                            href="https://github.com/akadeepesh/PythonAutomation"
                            target="__blank"
                          >
                            PythonAutomation
                          </a>
                          <a
                            href="https://github.com/akadeepesh/DjangoUserJWT"
                            target="__blank"
                          >
                            DjangoUserJWT
                          </a>
                          <a
                            href="https://github.com/akadeepesh/ChatWithWebsites"
                            target="__blank"
                          >
                            ChatWithWebsites
                          </a>
                          <a
                            href="https://github.com/akadeepesh/DataVisualizer"
                            target="__blank"
                          >
                            DataVisualizer
                          </a>
                          <a
                            href="https://github.com/akadeepesh/DjangoSessionAuthentication"
                            target="__blank"
                          >
                            DjangoSessionAuthentication
                          </a>
                          <a
                            href="https://github.com/akadeepesh/CollegeAdmissionManagement"
                            target="__blank"
                          >
                            CollegeAdmissionManagement
                          </a>
                          <a
                            href="https://github.com/akadeepesh/FirstDjangoProject"
                            target="__blank"
                          >
                            FirstDjangoProject
                          </a>
                        </div>
                        <Separator
                          orientation="vertical"
                          className="bg-foreground"
                        />
                        <div className="flex flex-col gap-1 justify-center items-center">
                          <a
                            href="https://github.com/akadeepesh/UserAuth"
                            target="__blank"
                          >
                            UserAuth
                          </a>
                          <a
                            href="https://github.com/akadeepesh/PixelToRem"
                            target="__blank"
                          >
                            PixelToRem
                          </a>
                          <a
                            href="https://github.com/akadeepesh/BankManagement-Python"
                            target="__blank"
                          >
                            BankManagementPython
                          </a>
                          <a
                            href="https://github.com/akadeepesh/DeleteCopiedFiles"
                            target="__blank"
                          >
                            DeleteCopiedFiles
                          </a>
                          <a
                            href="https://github.com/akadeepesh/SpeakToGPT"
                            target="__blank"
                          >
                            SpeakToGPT
                          </a>
                          <a
                            href="https://github.com/akadeepesh/GithubViewsCounter"
                            target="__blank"
                          >
                            GithubViewsCounter
                          </a>
                          <a
                            href="https://github.com/akadeepesh/Tkinter-Programs"
                            target="__blank"
                          >
                            TkinterPrograms
                          </a>
                        </div>
                        <Separator
                          orientation="vertical"
                          className="bg-foreground"
                        />
                        <div className="flex flex-col gap-1 justify-center items-end">
                          <a
                            href="https://github.com/akadeepesh/Tkinter-Games"
                            target="__blank"
                          >
                            TkinterGames
                          </a>
                          <a
                            href="https://github.com/akadeepesh/Rewards_Auto"
                            target="__blank"
                          >
                            RewardsAuto
                          </a>
                          <a
                            href="https://github.com/akadeepesh/News_For_Me"
                            target="__blank"
                          >
                            NewsForMe
                          </a>
                          <a
                            href="https://github.com/akadeepesh/Sentence_Correction"
                            target="__blank"
                          >
                            SentenceCorrection
                          </a>
                          <a
                            href="https://github.com/akadeepesh/Spotify_Add2playlist"
                            target="__blank"
                          >
                            SpotifyAdd2playlist
                          </a>
                          <a
                            href="https://github.com/akadeepesh/Password_manager"
                            target="__blank"
                          >
                            Password_manager
                          </a>
                          <a
                            href="https://github.com/akadeepesh/Django_basic"
                            target="__blank"
                          >
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
                        <a
                          href="https://github.com/akadeepesh/ML_Automation_Frontend"
                          target="__blank"
                        >
                          MLAutomationFrontend
                        </a>
                        <a
                          href="https://github.com/akadeepesh/VirtualAssistant"
                          target="__blank"
                        >
                          VirtualAssistant
                        </a>
                        <a
                          href="https://github.com/akadeepesh/ReCreating-FirstSite"
                          target="__blank"
                        >
                          ReCreatingFirstSite
                        </a>
                        <a
                          href="https://github.com/akadeepesh/FirstViteTried"
                          target="__blank"
                        >
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
                          <a
                            href="https://github.com/akadeepesh/DjangoUserJWT"
                            target="__blank"
                          >
                            DjangoUserJWT
                          </a>
                          <a
                            href="https://github.com/akadeepesh/Django_basic"
                            target="__blank"
                          >
                            Django_basic
                          </a>
                          <a
                            href="https://github.com/akadeepesh/FirstDjangoAssignment"
                            target="__blank"
                          >
                            FirstDjangoAssignment
                          </a>
                          <a
                            href="https://github.com/akadeepesh/DjangoAuth"
                            target="__blank"
                          >
                            DjangoAuth
                          </a>
                          <a
                            href="https://github.com/akadeepesh/VirtualMentor"
                            target="__blank"
                          >
                            VirtualMentor
                          </a>
                        </div>
                        <Separator
                          orientation="vertical"
                          className="bg-foreground"
                        />
                        <div className="flex flex-col gap-1 justify-center items-end">
                          <a
                            href="https://github.com/akadeepesh/DjangoSessionAuthentication"
                            target="__blank"
                          >
                            DjangoSessionAuthentication
                          </a>
                          <a
                            href="https://github.com/akadeepesh/Virtual-Mentor-EY"
                            target="__blank"
                          >
                            VirtualMentorEY
                          </a>
                          <a
                            href="https://github.com/akadeepesh/UserAuth"
                            target="__blank"
                          >
                            UserAuth
                          </a>
                          <a
                            href="https://github.com/akadeepesh/CollegeAdmissionManagement"
                            target="__blank"
                          >
                            CollegeAdmissionManagement
                          </a>
                          <a
                            href="https://github.com/akadeepesh/FirstDjangoProject"
                            target="__blank"
                          >
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
                        <a
                          href="https://github.com/akadeepesh/Tkinter-Games"
                          target="__blank"
                        >
                          TkinterGames
                        </a>
                        <a
                          href="https://github.com/akadeepesh/Tkinter-Programs"
                          target="__blank"
                        >
                          TkinterPrograms
                        </a>
                        <a
                          href="https://github.com/akadeepesh/BankManagement-Python"
                          target="__blank"
                        >
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
                          <a
                            href="https://github.com/akadeepesh/VirtualAssistant-1stTry"
                            target="__blank"
                          >
                            VirtualAssistant1stTry
                          </a>
                          <a
                            href="https://github.com/akadeepesh/happy-birthday"
                            target="__blank"
                          >
                            HappyBirthday
                          </a>
                          <a
                            href="https://github.com/akadeepesh/KeepItSimple"
                            target="__blank"
                          >
                            KeepItSimple
                          </a>
                          <a
                            href="https://github.com/akadeepesh/Django"
                            target="__blank"
                          >
                            Django
                          </a>
                        </div>
                        <Separator
                          orientation="vertical"
                          className="bg-foreground"
                        />
                        <div className="flex flex-col gap-1 justify-center items-end">
                          <a
                            href="https://github.com/akadeepesh/Page_404"
                            target="__blank"
                          >
                            Page404
                          </a>
                          <a
                            href="https://github.com/akadeepesh/deepesh_html"
                            target="__blank"
                          >
                            DeepeshHtml
                          </a>
                          <a
                            href="https://github.com/akadeepesh/Deepesh-Portfolio"
                            target="__blank"
                          >
                            DeepeshPortfolio
                          </a>
                          <a
                            href="https://github.com/akadeepesh/chrome_personalization"
                            target="__blank"
                          >
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
                          <a
                            href="https://github.com/akadeepesh/ML_Automation_Frontend"
                            target="__blank"
                          >
                            MLAutomationFrontend
                          </a>
                          <a
                            href="https://github.com/akadeepesh/DataVisualizationWeb"
                            target="__blank"
                          >
                            DataVisualizationWeb
                          </a>
                          <a
                            href="https://github.com/akadeepesh/FirstDjangoAssignment"
                            target="__blank"
                          >
                            FirstDjangoAssignment
                          </a>
                          <a
                            href="https://github.com/akadeepesh/MySky"
                            target="__blank"
                          >
                            MySky
                          </a>
                          <a
                            href="https://github.com/akadeepesh/VirtualAssistant"
                            target="__blank"
                          >
                            VirtualAssistant
                          </a>
                        </div>
                        <Separator
                          orientation="vertical"
                          className="bg-foreground"
                        />
                        <div className="flex flex-col gap-1 justify-center items-end">
                          <a
                            href="https://github.com/akadeepesh/VirtualAssistant-1stTry"
                            target="__blank"
                          >
                            VirtualAssistant1stTry
                          </a>
                          <a
                            href="https://github.com/akadeepesh/ReCreating-FirstSite"
                            target="__blank"
                          >
                            ReCreatingFirstSite
                          </a>
                          <a
                            href="https://github.com/akadeepesh/DjangoAuth"
                            target="__blank"
                          >
                            DjangoAuth
                          </a>
                          <a
                            href="https://github.com/akadeepesh/VirtualMentor"
                            target="__blank"
                          >
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
                        <a
                          href="https://github.com/akadeepesh/Virtual-Mentor-EY"
                          target="__blank"
                        >
                          VirtualMentorEY
                        </a>
                        <a
                          href="https://github.com/akadeepesh/FirstViteTried"
                          target="__blank"
                        >
                          FirstViteTried
                        </a>
                        <a
                          href="https://github.com/akadeepesh/MySky"
                          target="__blank"
                        >
                          MySky
                        </a>
                        <a
                          href="https://github.com/akadeepesh/data-creation"
                          target="__blank"
                        >
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
                        <a
                          href="https://github.com/akadeepesh/Cpp-DSA"
                          target="__blank"
                        >
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
                        <a
                          href="https://github.com/akadeepesh/BankManagement-Python"
                          target="__blank"
                        >
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
                        <a
                          href="https://github.com/akadeepesh/OnlineResume"
                          target="__blank"
                        >
                          OnlineResume
                        </a>
                        <a
                          href="https://github.com/akadeepesh/MySky"
                          target="__blank"
                        >
                          MySky
                        </a>
                        <a
                          href="https://github.com/akadeepesh/Virtual-Mentor-EY"
                          target="__blank"
                        >
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
                        <a
                          href="https://github.com/akadeepesh/deepesh_html"
                          target="__blank"
                        >
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
                        <a
                          href="https://github.com/akadeepesh/KeepItSimple"
                          target="__blank"
                        >
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
        <div className="Tools">
          <Card className="bg-primary-foreground">
            <CardHeader>
              <CardTitle className="font-bold">Tools</CardTitle>
              <CardDescription>
                <Separator className="bg-foreground" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-row justify-between">
                <div className="flex flex-col gap-3">
                  <Button className="cursor-default" variant="outline">
                    Git
                  </Button>
                  <Button className="cursor-default" variant="outline">
                    GitHub
                  </Button>
                  <Button className="cursor-default" variant="outline">
                    Figma
                  </Button>
                  <Button className="cursor-default" variant="outline">
                    Vs-Code
                  </Button>
                </div>
                <div className="flex flex-col gap-3">
                  <Button className="cursor-default" variant="outline">
                    Jupyter
                  </Button>
                  <Button className="cursor-default" variant="outline">
                    pycharm
                  </Button>
                  <Button className="cursor-default" variant="outline">
                    Google Colab
                  </Button>
                  <Button className="cursor-default" variant="outline">
                    Sublime Text
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="OS">
          <Card className="bg-primary-foreground">
            <CardHeader>
              <CardTitle className="font-bold">OS</CardTitle>
              <CardDescription>
                <Separator className="bg-foreground" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-5">
                <Button className="cursor-default" variant="destructive">
                  Ubuntu | Linux
                </Button>
                <Button className="cursor-default" variant="destructive">
                  Windows (11 | 10 | 8.1 | 7)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="Hobbies">
          <Card className="bg-primary-foreground">
            <CardHeader>
              <CardTitle className="font-bold">Hobbies & Interests</CardTitle>
              <CardDescription>
                <Separator className="bg-foreground" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-5">
                <Label className="cursor-default">Programming</Label>
                <Label className="cursor-default">Automation</Label>
                <Label className="cursor-default">Beatbox</Label>
                <Label className="cursor-default">Poetry</Label>
                <Label className="cursor-default">Dance</Label>
                <Label className="cursor-default">Rap</Label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Separator
        orientation="horizontal"
        className="bg-foreground ml-24 md:hidden w-full h-1 rounded"
      />
      <Separator
        orientation="vertical"
        className="bg-foreground hidden md:block"
      />
      <div className="flex flex-col items-center ml-auto gap-10">
        <div className="About flex flex-col gap-5 w-screen md:w-auto">
          <div className="text-5xl">About</div>
          <Card>
            <CardHeader>
              <CardTitle className="font-extrabold">Deepesh Kumar</CardTitle>
              <CardDescription>Full Stack Web Developer</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Driven and versatile full-stack web developer with a strong
                focus on crafting user-friendly, automated solutions. I am a
                3rd-year student at Netaji Subhas University of Technology,
                proficient in Python, C++, Django, Next.js, and more. During my
                internship at BrainIntelCorp, I successfully developed an
                emotion recognition model with 85% accuracy, significantly
                improving their customer service operations. I am dedicated to
                making technology accessible and strive to leverage my skills
                and innovative thinking to contribute to your team&apos;s
                success.
              </p>
            </CardContent>
          </Card>
        </div>
        <Separator orientation="horizontal" className="bg-foreground" />
        <div className="Exp flex flex-col gap-5 w-screen md:w-auto">
          <div className="text-5xl">Experience</div>
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-row justify-between">
                <div className="font-extrabold">Python Developer</div>
                <div className="text-base text-muted-foreground">
                  Jun 2023 - Jul 2023
                </div>
              </CardTitle>
              <CardDescription>BrainIntelCorp (Startup)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-semibold text-lg mb-3">
                Emotion Detection by Voice Recognition
              </p>
              <div className="flex flex-col">
                <div className="flex flex-row gap-3">
                  <p>•</p>
                  <p>
                    Developed a highly accurate Neural Network model for emotion
                    detection through voice.
                  </p>
                </div>
                <div className="flex flex-row gap-3">
                  <p>•</p>
                  <p>
                    Trained the model utilizing open-source datasets, resulting
                    in an impressive accuracy rate of85%.
                  </p>
                </div>
                <div className="flex flex-row gap-3">
                  <p>•</p>
                  <p>
                    Conducted extensive experiments with diverse deep learning
                    and machine learning algorithms toenhance model accuracy.
                  </p>
                </div>
                <div className="flex flex-row gap-3">
                  <p>•</p>
                  <p>
                    Successfully implemented the project using Python and
                    various essential modules such as OS,Librosa, sklearn,
                    keras, Transformers, Xception, and numpy.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Separator orientation="horizontal" className="bg-foreground" />
        <div className="Project flex flex-col gap-5 w-screen md:w-auto">
          <div className="text-5xl">Projects</div>
          <div className="flex flex-col gap-10">
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-row justify-between">
                  <div className="font-bold">NLP Helping tools</div>
                  <div className="text-base text-muted-foreground">
                    Dec 2023 - Present
                  </div>
                </CardTitle>
                <CardDescription>
                  Helps in Tokenization, Stemming/lemmatation, Stop Word Removal
                  etc
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col">
                  <div className="flex flex-row gap-3">
                    <p>•</p>
                    <p>
                      Full Stack Application (Django and React.js) with REST
                      API.
                    </p>
                  </div>
                  <div className="flex flex-row gap-3">
                    <p>•</p>
                    <p>
                      Authentication and Authorization with Django custom user
                      base models using JWT.
                    </p>
                  </div>
                  <div className="flex flex-row gap-3">
                    <p>•</p>
                    <p>
                      Material-Tailwind UI, Tailwind CSS and Mauve colors have
                      been used for better UI.
                    </p>
                  </div>
                  <div className="flex flex-row gap-3">
                    <p>•</p>
                    <p>
                      Successfully implemented the project using Python and
                      various essential modules such as OS,Librosa, sklearn,
                      keras, Transformers, Xception, and numpy.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-row justify-between">
                  <div className="font-bold">Poetry Showcase</div>
                  <div className="text-base text-muted-foreground">
                    14 NOV 2023
                  </div>
                </CardTitle>
                <CardDescription>
                  A simple UI app to showcase poetries written by me.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col">
                  <div className="flex flex-row gap-3">
                    <p>•</p>
                    <p>
                      Full Stack Application created within 3 hours with Django
                      Rest Framework and Next.js.
                    </p>
                  </div>
                  <div className="flex flex-row gap-3">
                    <p>•</p>
                    <p>
                      Complete integration of Next.js with Clerk Auth for
                      Authentication and Authorization.
                    </p>
                  </div>
                  <div className="flex flex-row gap-3">
                    <p>•</p>
                    <p>
                      For frontend design library I chose ShadcnUI, having
                      minimal dark and light theme.
                    </p>
                  </div>
                  <div className="flex flex-row gap-3">
                    <p>•</p>
                    <p>Fully responsive single page simple app.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-row justify-between">
                  <div className="font-bold">Personal Voice Assistant</div>
                  <div className="text-base text-muted-foreground">
                    Oct 2022 - Jan 2023
                  </div>
                </CardTitle>
                <CardDescription>
                  A personal web assistant for various use across the system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col">
                  <div className="flex flex-row gap-3">
                    <p>•</p>
                    <p>
                      Full Stack Application using Django Rest Framework &
                      React.js connected through REST API.
                    </p>
                  </div>
                  <div className="flex flex-row gap-3">
                    <p>•</p>
                    <p>
                      Using Python Speech Recognizer and performing multiple
                      operations accordingly.
                    </p>
                  </div>
                  <div className="flex flex-row gap-3">
                    <p>•</p>
                    <p>
                      GPT4ALL an open source local LLM model is integrated in
                      this WebApp.
                    </p>
                  </div>
                  <div className="flex flex-row gap-3">
                    <p>•</p>
                    <p>
                      Some main features are - Sending messages to WhatsApp
                      using name of user, Running/closing anyapplication, Asking
                      queries to GPT, location on google maps etc.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Separator orientation="horizontal" className="bg-foreground" />
        <div className="flex flex-col gap-5">
          <div className="text-5xl">Certifications</div>
          <div className="flex flex-row justify-between">
            <div className="flex flex-col">
              <div className="">
                <Button variant={"ghost"}>
                  <HoverCard>
                    <HoverCardTrigger className="w-fit">
                      Python (Basic) Certificate
                    </HoverCardTrigger>
                    <HoverCardContent className="flex flex-row">
                      <a
                        href="https://hackerrank.com/certificates/a63c9ae3221c?utm_medium=email&utm_source=mail_template_1393&utm_campaign=hrc_skills_certificate"
                        target="__blank"
                      >
                        <Card>
                          <CardHeader>
                            <CardTitle>
                              <Button variant={"link"}>
                                Python (Basic) Certificate
                              </Button>
                            </CardTitle>
                            <CardDescription>Issued Feb 2022</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p>HackerRank</p>
                          </CardContent>
                          <CardFooter>
                            <p>Skills : Python (Programming Language)</p>
                          </CardFooter>
                        </Card>
                      </a>
                    </HoverCardContent>
                  </HoverCard>
                </Button>
              </div>
              <div className="">
                <Button variant={"ghost"}>
                  <HoverCard>
                    <HoverCardTrigger className="w-fit">
                      Problem Solving (Basic) Certificate
                    </HoverCardTrigger>
                    <HoverCardContent className="flex flex-row">
                      <a
                        href="https://www.hackerrank.com/certificates/771a2eef8697"
                        target="__blank"
                      >
                        <Card>
                          <CardHeader>
                            <CardTitle>
                              <Button variant={"link"}>
                                Problem Solving (Basic) Certificate
                              </Button>
                            </CardTitle>
                            <CardDescription>Issued Sep 2022</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p>HackerRank</p>
                          </CardContent>
                          <CardFooter>
                            <p>Skills : Logical Problem Solving</p>
                          </CardFooter>
                        </Card>
                      </a>
                    </HoverCardContent>
                  </HoverCard>
                </Button>
              </div>
              <div className="">
                <Button variant={"ghost"}>
                  <HoverCard>
                    <HoverCardTrigger className="w-fit">
                      SQL (Basic) Certificate
                    </HoverCardTrigger>
                    <HoverCardContent className="flex flex-row">
                      <a
                        href="https://www.hackerrank.com/certificates/8e579853d4fc"
                        target="__blank"
                      >
                        <Card>
                          <CardHeader>
                            <CardTitle>
                              <Button variant={"link"}>
                                SQL (Basic) Certificate
                              </Button>
                            </CardTitle>
                            <CardDescription>Issued Sep 2022</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p>HackerRank</p>
                          </CardContent>
                          <CardFooter>
                            <p>Skills : SQL</p>
                          </CardFooter>
                        </Card>
                      </a>
                    </HoverCardContent>
                  </HoverCard>
                </Button>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="">
                <Button variant={"ghost"}>
                  <HoverCard>
                    <HoverCardTrigger className="w-fit">
                      C++ Data Structures and Algorithms
                    </HoverCardTrigger>
                    <HoverCardContent className="flex flex-row">
                      <a
                        href="https://cert.devtown.in/verify/Z2tARCS"
                        target="__blank"
                      >
                        <Card>
                          <CardHeader>
                            <CardTitle>
                              <Button variant={"link"}>
                                C++ Data Structures and Algorithms
                              </Button>
                            </CardTitle>
                            <CardDescription>Issued Oct 2022</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p>DevTown</p>
                          </CardContent>
                          <CardFooter>
                            <p>Skills : DSA in C++</p>
                          </CardFooter>
                        </Card>
                      </a>
                    </HoverCardContent>
                  </HoverCard>
                </Button>
              </div>
              <div className="">
                <Button variant={"ghost"}>
                  <HoverCard>
                    <HoverCardTrigger className="w-fit">
                      Microsoft AI Skills Challenge
                    </HoverCardTrigger>
                    <HoverCardContent className="flex flex-row">
                      <a
                        href="https://drive.google.com/file/d/1oUvEqEbVNdgr-oCm4iSio79ia3QwLNwE/view"
                        target="__blank"
                      >
                        <Card>
                          <CardHeader>
                            <CardTitle>
                              <Button variant={"link"}>
                                Azure AI Skills Challenge
                              </Button>
                            </CardTitle>
                            <CardDescription>Issued Jan 2024</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p>Microsoft</p>
                          </CardContent>
                          <CardFooter>
                            <p>Skills : Microsoft Azure Machine Learning</p>
                          </CardFooter>
                        </Card>
                      </a>
                    </HoverCardContent>
                  </HoverCard>
                </Button>
              </div>
              <div className="">
                <Button variant={"ghost"}>
                  <HoverCard>
                    <HoverCardTrigger className="w-fit">
                      Holopin Badges
                    </HoverCardTrigger>
                    <HoverCardContent className="flex flex-row">
                      <a
                        href="https://www.holopin.io/@akadeepesh#badges"
                        target="__blank"
                      >
                        <Card>
                          <CardHeader>
                            <CardTitle>
                              <Button variant={"link"}>
                                Holopin Badges - HacktoberFest
                              </Button>
                            </CardTitle>
                            <CardDescription>Issued Jan 2023</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p>DevTown</p>
                          </CardContent>
                          <CardFooter>
                            <p>Skills : Open Source Contributions</p>
                          </CardFooter>
                        </Card>
                      </a>
                    </HoverCardContent>
                  </HoverCard>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeCoder;

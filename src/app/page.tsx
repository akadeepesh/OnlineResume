import ResumePage from "@/components/ResumePage";
import { siteConfig } from "@/config/site";

export default function Home() {
  return <ResumePage template={siteConfig.template} />;
}

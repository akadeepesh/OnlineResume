import {
  Brain,
  Code,
  Cpu,
  Database,
  FileCode,
  Folder,
  Globe,
  Trophy,
  type LucideProps,
} from "lucide-react";
import type { IconKey } from "@/data/resume";

const icons = {
  code: Code,
  cpu: Cpu,
  brain: Brain,
  trophy: Trophy,
  database: Database,
  globe: Globe,
  folder: Folder,
  file: FileCode,
} satisfies Record<IconKey, React.ComponentType<LucideProps>>;

export function SkillIcon({ name, ...props }: { name: IconKey } & LucideProps) {
  const Icon = icons[name] ?? Code;
  return <Icon {...props} />;
}

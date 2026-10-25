"use client";

import React from "react";
import Image from "next/image";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  Award,
  Briefcase,
  Calendar,
  Database,
  Download,
  ExternalLink,
  FolderGit2,
  GitFork,
  Github,
  GraduationCap,
  Info,
  Layers,
  Linkedin,
  Mail,
  MapPin,
  Star,
  User,
  Wrench,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RichText } from "@/components/shared/RichText";
import { SkillIcon } from "@/components/shared/SkillIcon";
import {
  formatRepoDate,
  formatRepoSize,
  repoUrl,
  useRepoData,
} from "@/lib/github";
import type { Resume, Skill, Site } from "@/data/resume";

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

const Section: React.FC<{
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}> = ({ title, icon: Icon, children, className = "" }) => (
  <section
    className={`animate-fade-up rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-8 ${className}`}
  >
    <header className="mb-6 flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <h2 className="text-lg font-semibold tracking-tight text-slate-900">
        {title}
      </h2>
    </header>
    {children}
  </section>
);

const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">
    {children}
  </span>
);

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

const ProfileCard: React.FC<{ profile: Resume["profile"] }> = ({ profile }) => {
  const socials = [
    { href: profile.socials.github, label: "GitHub", icon: Github },
    { href: profile.socials.linkedin, label: "LinkedIn", icon: Linkedin },
    { href: `mailto:${profile.socials.email}`, label: "Email", icon: Mail },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="relative h-28 bg-slate-900">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)",
            backgroundSize: "14px 14px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/40 via-transparent to-sky-400/20" />
      </div>
      <div className="px-6 pb-6">
        <div className="relative -mt-12 flex items-end justify-between">
          <Image
            src={profile.avatar}
            width={96}
            height={96}
            className="rounded-2xl border-4 border-white bg-white shadow-md"
            alt={profile.name}
            priority
          />
          {profile.availability && (
            <span className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {profile.availability}
            </span>
          )}
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
          {profile.name}
        </h1>
        <p className="text-sm font-medium text-indigo-600">{profile.role}</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {profile.tagline}
        </p>
        <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin className="h-4 w-4" />
          {profile.location}
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {socials.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </a>
          ))}
        </div>
        <a
          href={profile.resumeUrl}
          download
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          <Download className="h-4 w-4" />
          Download Resume
        </a>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Skills → repositories (GitHub backed)
// ---------------------------------------------------------------------------

const RepoCard: React.FC<{ name: string }> = ({ name }) => {
  const { data, loading, error, enabled } = useRepoData(name);

  return (
    <a
      href={repoUrl(name)}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-indigo-300 hover:shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Github className="h-4 w-4 flex-shrink-0 text-slate-500" />
          <h4 className="truncate text-sm font-semibold text-slate-900">
            {name}
          </h4>
        </div>
        {loading ? (
          <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
        ) : data ? (
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5" />
              {data.stargazers_count}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="h-3.5 w-3.5" />
              {data.forks_count}
            </span>
            {data.open_issues_count > 0 && (
              <span className="flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {data.open_issues_count}
              </span>
            )}
          </div>
        ) : (
          <ArrowUpRight className="h-4 w-4 text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        )}
      </div>
      {data?.description && (
        <p className="mt-2 line-clamp-2 text-sm text-slate-600">
          {data.description}
        </p>
      )}
      {data?.topics && data.topics.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {data.topics.slice(0, 5).map((topic) => (
            <span
              key={topic}
              className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700"
            >
              {topic}
            </span>
          ))}
        </div>
      )}
      {data && (
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Activity className="h-3.5 w-3.5" />
            Updated {formatRepoDate(data.updated_at)}
          </span>
          <span className="flex items-center gap-1">
            <Database className="h-3.5 w-3.5" />
            {formatRepoSize(data.size)}
          </span>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-rose-500">{error}</p>}
      {!enabled && (
        <p className="mt-2 text-xs text-slate-400">Live GitHub stats disabled</p>
      )}
    </a>
  );
};

const SiteCard: React.FC<{ site: Site }> = ({ site }) => (
  <a
    href={site.url}
    target="_blank"
    rel="noopener noreferrer"
    className="group block overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:border-indigo-300 hover:shadow-sm"
  >
    <div className="flex h-24 items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-900 px-4">
      <span className="text-center text-lg font-semibold text-white">
        {site.title}
      </span>
    </div>
    <div className="p-4">
      <p className="text-sm text-slate-600">{site.description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {site.tags.map((tag) => (
          <Chip key={tag}>{tag}</Chip>
        ))}
      </div>
      <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-600">
        Visit site <ExternalLink className="h-3.5 w-3.5" />
      </span>
    </div>
  </a>
);

const SkillDialog: React.FC<{ skill: Skill }> = ({ skill }) => (
  <Dialog>
    <DialogTrigger asChild>
      <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700">
        <SkillIcon name={skill.icon} className="h-3.5 w-3.5" />
        {skill.name}
        <span className="ml-0.5 text-xs text-slate-400">
          {skill.repos.length + (skill.sites?.length ?? 0)}
        </span>
      </button>
    </DialogTrigger>
    <DialogContent className="overflow-hidden border-slate-200 bg-slate-50 p-0 sm:max-w-[600px] sm:rounded-2xl">
      <div className="p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-slate-900">
            <SkillIcon name={skill.icon} className="h-5 w-5 text-indigo-600" />
            {skill.name} Projects
          </DialogTitle>
        </DialogHeader>
        {skill.repos.length > 0 && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-indigo-100 bg-indigo-50/70 p-3 text-sm text-indigo-800">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>
              Set{" "}
              <code className="rounded bg-indigo-100 px-1 py-0.5 font-mono text-xs">
                NEXT_PUBLIC_GH_OWNER
              </code>{" "}
              to your GitHub username to show live stars, forks and topics.
            </p>
          </div>
        )}
        <ScrollArea className="h-[60vh] pr-3">
          <div className="grid gap-3">
            {skill.sites?.map((site) => <SiteCard key={site.url} site={site} />)}
            {skill.repos.map((repo) => (
              <RepoCard key={repo} name={repo} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </DialogContent>
  </Dialog>
);

// ---------------------------------------------------------------------------
// Template
// ---------------------------------------------------------------------------

export default function ClassicTemplate({ data }: { data: Resume }) {
  const { profile, about, experience, projects, skills, tools, education, certifications } =
    data;

  return (
    <div className="min-h-screen bg-[#f5f6f8] font-sans text-slate-900">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-indigo-100/60 to-transparent" />
      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        {/* Single render: on mobile, DOM order is profile → main → side.
            On desktop, profile + side stack in the left column. */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr] lg:grid-rows-[auto_1fr] lg:gap-8">
          <div className="lg:col-start-1 lg:row-start-1">
            <ProfileCard profile={profile} />
          </div>

          <main className="space-y-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:space-y-8">
            <Section title="About" icon={User}>
              <p className="leading-relaxed text-slate-600">
                <RichText text={about} strongClassName="font-semibold text-slate-900" />
              </p>
            </Section>

            <Section title="Experience" icon={Briefcase}>
              <ol className="relative space-y-8 border-l border-slate-200 pl-6">
                {experience.map((exp, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-indigo-500 ring-4 ring-indigo-50" />
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                      <h3 className="font-semibold text-slate-900">{exp.title}</h3>
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        {exp.date}
                      </span>
                    </div>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-slate-500">
                      <span className="font-medium text-indigo-600">{exp.company}</span>
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {exp.location}
                      </span>
                    </p>
                    {exp.responsibilities.length > 0 && (
                      <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-slate-600">
                        {exp.responsibilities.map((r, j) => (
                          <li key={j} className="flex gap-2">
                            <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-slate-400" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    )}
                    {exp.skills.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {exp.skills.map((s) => (
                          <Chip key={s}>{s}</Chip>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </Section>

            <Section title="Projects" icon={FolderGit2}>
              <div className="grid gap-4 md:grid-cols-2">
                {projects.map((project) => (
                  <article
                    key={project.name}
                    className="group flex flex-col rounded-xl border border-slate-200 p-5 transition-all hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold leading-snug text-slate-900">
                        {project.name}
                      </h3>
                      <div className="flex flex-shrink-0 gap-1">
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="GitHub Repository"
                          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
                        >
                          <Github className="h-4 w-4" />
                        </a>
                        {project.demo && (
                          <a
                            href={project.demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Live Demo"
                            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{project.description}</p>
                    <ul className="mt-3 flex-1 space-y-1.5 text-sm text-slate-500">
                      {project.details.map((d, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-slate-300" />
                          {d}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {project.technologies.map((t) => (
                        <Chip key={t}>{t}</Chip>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </Section>

            <Section title="Certifications" icon={Award}>
              <div className="grid gap-3 sm:grid-cols-2">
                {certifications.map((cert, i) => (
                  <Dialog key={i}>
                    <DialogTrigger asChild>
                      <button className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition-all hover:border-indigo-200 hover:bg-indigo-50/40">
                        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                          <SkillIcon name={cert.icon} className="h-5 w-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-slate-900">
                            {cert.name}
                          </span>
                          <span className="block text-xs text-slate-500">
                            {cert.issuer} · {cert.date}
                          </span>
                        </span>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="w-[92%] border-slate-200 bg-white sm:max-w-md sm:rounded-2xl">
                      <DialogHeader>
                        <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <SkillIcon name={cert.icon} className="h-5 w-5" />
                        </span>
                        <DialogTitle className="text-left text-lg text-slate-900">
                          {cert.name}
                        </DialogTitle>
                        <p className="text-left text-sm text-slate-500">
                          {cert.issuer} · {cert.date}
                        </p>
                      </DialogHeader>
                      <p className="text-sm leading-relaxed text-slate-600">
                        {cert.description}
                      </p>
                      <a
                        href={cert.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                      >
                        View Certificate
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            </Section>
          </main>

          <aside className="space-y-6 self-start lg:col-start-1 lg:row-start-2">
            <Section title="Skills & Projects" icon={Layers}>
              <p className="-mt-3 mb-4 text-sm text-slate-500">
                Select a skill to explore related work.
              </p>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <SkillDialog key={skill.name} skill={skill} />
                ))}
              </div>
            </Section>

            <Section title="Tools" icon={Wrench}>
              <div className="space-y-4">
                {tools.map((cat) => (
                  <div key={cat.name}>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {cat.name}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.skills.map((s) => (
                        <Chip key={s}>{s}</Chip>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Education" icon={GraduationCap}>
              <div className="space-y-5">
                {education.map((edu) => (
                  <div key={edu.institution}>
                    <h3 className="font-semibold text-slate-900">{edu.institution}</h3>
                    <p className="text-sm text-slate-600">{edu.degree}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {edu.period}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {edu.location}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </Section>
          </aside>
        </div>

        <footer className="mt-12 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} {profile.name}
        </footer>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import {
  Award,
  Briefcase,
  Calendar,
  Download,
  ExternalLink,
  FolderGit2,
  Github,
  GraduationCap,
  Layers,
  Linkedin,
  Mail,
  MapPin,
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
import { Avatar } from "@/components/shared/Avatar";
import { RichText } from "@/components/shared/RichText";
import { SkillIcon } from "@/components/shared/SkillIcon";
import type { Resume, Skill } from "@/lib/resume/schema";
import { has, joinParts, presentSections, socialLinks, workForSkill, type LinkedWork } from "@/lib/resume/view";
import { renderBlocks } from "../blocks";

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

const SOCIAL_ICONS = { github: Github, linkedin: Linkedin, email: Mail } as const;

const ProfileCard: React.FC<{ profile: Resume["profile"] }> = ({ profile }) => {
  const socials = socialLinks(profile.socials);

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
          <Avatar
            src={profile.avatar}
            name={profile.name}
            size={96}
            className="rounded-2xl border-4 border-white bg-white shadow-md"
            fallbackClassName="bg-indigo-50 text-indigo-600"
            priority
          />
          {has(profile.availability) && (
            <span className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {profile.availability}
            </span>
          )}
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
          {profile.name}
        </h1>
        {has(profile.role) && (
          <p className="text-sm font-medium text-indigo-600">{profile.role}</p>
        )}
        {has(profile.tagline) && (
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {profile.tagline}
          </p>
        )}
        {has(profile.location) && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin className="h-4 w-4" />
            {profile.location}
          </p>
        )}

        {socials.length > 0 && (
          <div
            className="mt-5 grid gap-2"
            style={{ gridTemplateColumns: `repeat(${socials.length}, minmax(0, 1fr))` }}
          >
            {socials.map(({ kind, href, label }) => {
              const Icon = SOCIAL_ICONS[kind];
              return (
                <a
                  key={kind}
                  href={href}
                  target={kind === "email" ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </a>
              );
            })}
          </div>
        )}
        {has(profile.resumeUrl) && (
          <a
            href={profile.resumeUrl}
            download
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            <Download className="h-4 w-4" />
            Download Resume
          </a>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Skills → the projects that use them
// ---------------------------------------------------------------------------

const WorkCard: React.FC<{ work: LinkedWork }> = ({ work }) => {
  const body = (
    <>
      <div className="flex h-24 items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-900 px-4">
        <span className="text-center text-lg font-semibold text-white">{work.title}</span>
      </div>
      <div className="p-4">
        {has(work.description) && <p className="text-sm text-slate-600">{work.description}</p>}
        {work.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {work.tags.map((tag) => (
              <Chip key={tag}>{tag}</Chip>
            ))}
          </div>
        )}
        {work.href && (
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-600">
            View project <ExternalLink className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
    </>
  );
  const className = "group block overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:border-indigo-300 hover:shadow-sm";
  return work.href ? (
    <a href={work.href} target="_blank" rel="noopener noreferrer" className={className}>
      {body}
    </a>
  ) : (
    <div className={className}>{body}</div>
  );
};

const SkillDialog: React.FC<{ skill: Skill; work: LinkedWork[] }> = ({ skill, work }) => {
  const count = work.length;
  // Nothing to open: a plain chip instead of a dialog with an empty list.
  if (count === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700">
        <SkillIcon name={skill.icon} className="h-3.5 w-3.5" />
        {skill.name}
      </span>
    );
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700">
          <SkillIcon name={skill.icon} className="h-3.5 w-3.5" />
          {skill.name}
          <span className="ml-0.5 text-xs text-slate-400">{count}</span>
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
          <ScrollArea className="h-[60vh] pr-3">
            <div className="grid gap-3">
              {work.map((item, i) => (
                <WorkCard key={i} work={item} />
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ---------------------------------------------------------------------------
// Template
// ---------------------------------------------------------------------------

export default function ClassicTemplate({ data }: { data: Resume }) {
  const { profile, about, experience, projects, skills, tools, education, certifications } =
    data;
  const show = presentSections(data);

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
            {renderBlocks(data, [
              show.about && {
                id: "about",
                sections: ["about"],
                render: () => (
                  <Section title="About" icon={User}>
                    <p className="leading-relaxed text-slate-600">
                      <RichText text={about ?? ""} strongClassName="font-semibold text-slate-900" />
                    </p>
                  </Section>
                ),
              },

              show.experience && {
                id: "experience",
                sections: ["experience"],
                render: () => (
                  <Section title="Experience" icon={Briefcase}>
                    <ol className="relative space-y-8 border-l border-slate-200 pl-6">
                      {experience.map((exp, i) => (
                        <li key={i} className="relative">
                          <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-indigo-500 ring-4 ring-indigo-50" />
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                            <h3 className="font-semibold text-slate-900">{exp.title}</h3>
                            {has(exp.date) && (
                              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                {exp.date}
                              </span>
                            )}
                          </div>
                          {(has(exp.company) || has(exp.location)) && (
                            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-slate-500">
                              {has(exp.company) && (
                                <span className="font-medium text-indigo-600">{exp.company}</span>
                              )}
                              {has(exp.company) && has(exp.location) && (
                                <span className="text-slate-300">•</span>
                              )}
                              {has(exp.location) && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {exp.location}
                                </span>
                              )}
                            </p>
                          )}
                          {exp.responsibilities.length > 0 && (
                            <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-slate-600">
                              {exp.responsibilities.map((r, j) => (
                                <li key={j} className="flex gap-2">
                                  <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-slate-400" />
                                  <span>
                                    <RichText text={r} strongClassName="font-semibold text-slate-900" />
                                  </span>
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
                ),
              },

              show.projects && {
                id: "projects",
                sections: ["projects"],
                render: () => (
                  <Section title="Projects" icon={FolderGit2}>
                    <div className="grid gap-4 md:grid-cols-2">
                      {projects.map((project, i) => (
                        <article
                          key={i}
                          className="group flex flex-col rounded-xl border border-slate-200 p-5 transition-all hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="font-semibold leading-snug text-slate-900">
                              {project.name}
                            </h3>
                            <div className="flex flex-shrink-0 gap-1">
                              {has(project.github) && (
                                <a
                                  href={project.github}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label="GitHub Repository"
                                  className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
                                >
                                  <Github className="h-4 w-4" />
                                </a>
                              )}
                              {has(project.demo) && (
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
                          {has(project.description) && (
                            <p className="mt-2 text-sm text-slate-600">{project.description}</p>
                          )}
                          {project.details.length > 0 && (
                            <ul className="mt-3 flex-1 space-y-1.5 text-sm text-slate-500">
                              {project.details.map((d, j) => (
                                <li key={j} className="flex gap-2">
                                  <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-slate-300" />
                                  <RichText text={d} strongClassName="font-semibold text-slate-900" />
                                </li>
                              ))}
                            </ul>
                          )}
                          {project.technologies.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-1.5">
                              {project.technologies.map((t) => (
                                <Chip key={t}>{t}</Chip>
                              ))}
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
                  </Section>
                ),
              },

              show.certifications && {
                id: "certifications",
                sections: ["certifications"],
                render: () => (
                  <Section title="Certifications" icon={Award}>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {certifications.map((cert, i) => {
                        const meta = joinParts([cert.issuer, cert.date]);
                        return (
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
                                  {meta && <span className="block text-xs text-slate-500">{meta}</span>}
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
                                {meta && <p className="text-left text-sm text-slate-500">{meta}</p>}
                              </DialogHeader>
                              {has(cert.description) && (
                                <p className="text-sm leading-relaxed text-slate-600">
                                  {cert.description}
                                </p>
                              )}
                              {has(cert.link) && (
                                <a
                                  href={cert.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                                >
                                  View Certificate
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              )}
                            </DialogContent>
                          </Dialog>
                        );
                      })}
                    </div>
                  </Section>
                ),
              },
            ])}
          </main>

          <aside className="space-y-6 self-start lg:col-start-1 lg:row-start-2">
            {renderBlocks(data, [
              show.skills && {
                id: "skills",
                sections: ["skills"],
                render: () => (
                  <Section title="Skills & Projects" icon={Layers}>
                    {skills.some((s) => workForSkill(data, s).length > 0) && (
                      <p className="-mt-3 mb-4 text-sm text-slate-500">
                        Select a skill to explore related work.
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, i) => (
                        <SkillDialog key={i} skill={skill} work={workForSkill(data, skill)} />
                      ))}
                    </div>
                  </Section>
                ),
              },

              show.tools && {
                id: "tools",
                sections: ["tools"],
                render: () => (
                  <Section title="Tools" icon={Wrench}>
                    <div className="space-y-4">
                      {tools.map((cat, i) => (
                        <div key={i}>
                          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            {cat.name}
                          </h3>
                          {cat.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {cat.skills.map((s) => (
                                <Chip key={s}>{s}</Chip>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Section>
                ),
              },

              show.education && {
                id: "education",
                sections: ["education"],
                render: () => (
                  <Section title="Education" icon={GraduationCap}>
                    <div className="space-y-5">
                      {education.map((edu, i) => (
                        <div key={i}>
                          <h3 className="font-semibold text-slate-900">{edu.institution}</h3>
                          {has(edu.degree) && <p className="text-sm text-slate-600">{edu.degree}</p>}
                          {(has(edu.period) || has(edu.location)) && (
                            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                              {has(edu.period) && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {edu.period}
                                </span>
                              )}
                              {has(edu.location) && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {edu.location}
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </Section>
                ),
              },
            ])}
          </aside>
        </div>

        <footer className="mt-12 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} {profile.name}
        </footer>
      </div>
    </div>
  );
}

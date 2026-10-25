"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Download,
  GitFork,
  Github,
  Linkedin,
  Mail,
  Star,
} from "lucide-react";
import { RichText } from "@/components/shared/RichText";
import { SkillIcon } from "@/components/shared/SkillIcon";
import { formatRepoDate, repoUrl, useRepoData } from "@/lib/github";
import type { Resume, Skill } from "@/data/resume";

const NAV = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "credentials", label: "Credentials" },
] as const;

const Pill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="flex items-center rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-5 text-teal-300">
    {children}
  </li>
);

const SectionHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="sticky top-0 z-20 -mx-6 mb-4 w-screen bg-[#0b1120]/75 px-6 py-5 backdrop-blur md:-mx-12 md:px-12 lg:sr-only lg:relative lg:top-auto lg:mx-auto lg:w-full lg:px-0 lg:py-0 lg:opacity-0">
    <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200">
      {children}
    </h2>
  </div>
);

/** Card with the signature hover surface + sibling dimming. */
const HoverCard: React.FC<{ children: React.ReactNode; href?: string }> = ({
  children,
  href,
}) => {
  const body = (
    <div className="group relative grid pb-1 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 lg:hover:!opacity-100 lg:group-hover/list:opacity-50">
      <div className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-6 lg:block lg:group-hover:bg-slate-800/50 lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg" />
      {children}
    </div>
  );
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block">
      {body}
    </a>
  ) : (
    body
  );
};

const RepoTile: React.FC<{ name: string }> = ({ name }) => {
  const { data, loading } = useRepoData(name);
  return (
    <a
      href={repoUrl(name)}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-lg border border-slate-800 bg-slate-900/40 p-4 transition-colors hover:border-teal-400/40 hover:bg-slate-800/40"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="truncate font-medium text-slate-200 group-hover:text-teal-300">
          {name}
        </span>
        <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-slate-500 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-teal-300" />
      </div>
      {loading && <div className="mt-3 h-3 w-2/3 animate-pulse rounded bg-slate-800" />}
      {data?.description && (
        <p className="mt-2 line-clamp-2 text-sm text-slate-400">{data.description}</p>
      )}
      {data && (
        <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5" /> {data.stargazers_count}
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="h-3.5 w-3.5" /> {data.forks_count}
          </span>
          <span>Updated {formatRepoDate(data.updated_at)}</span>
        </div>
      )}
    </a>
  );
};

export default function SpotlightTemplate({ data }: { data: Resume }) {
  const { profile, about, experience, projects, skills, tools, education, certifications } =
    data;
  const [active, setActive] = useState<string>("about");
  const [skill, setSkill] = useState<Skill>(skills[0]);
  const rootRef = useRef<HTMLDivElement>(null);

  // Cursor-following spotlight
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      el.style.setProperty("--x", `${e.clientX}px`);
      el.style.setProperty("--y", `${e.clientY}px`);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // Active section tracking for the nav
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    NAV.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const socials = [
    { href: profile.socials.github, label: "GitHub", icon: Github },
    { href: profile.socials.linkedin, label: "LinkedIn", icon: Linkedin },
    { href: `mailto:${profile.socials.email}`, label: "Email", icon: Mail },
  ];

  return (
    <div
      ref={rootRef}
      className="relative min-h-screen bg-[#0b1120] font-sans leading-relaxed text-slate-400 antialiased selection:bg-teal-300 selection:text-teal-900"
    >
      <div
        className="pointer-events-none fixed inset-0 z-30 transition duration-300"
        style={{
          background:
            "radial-gradient(600px at var(--x, 50%) var(--y, 20%), rgba(29, 78, 216, 0.15), transparent 80%)",
        }}
      />
      <div className="mx-auto min-h-screen max-w-screen-xl px-6 py-12 md:px-12 md:py-20 lg:px-24 lg:py-0">
        <div className="lg:flex lg:justify-between lg:gap-4">
          {/* Left / fixed column */}
          <header className="lg:sticky lg:top-0 lg:flex lg:max-h-screen lg:w-1/2 lg:flex-col lg:justify-between lg:py-24">
            <div>
              <Image
                src={profile.avatar}
                alt={profile.name}
                width={72}
                height={72}
                priority
                className="mb-6 rounded-full ring-2 ring-slate-700/60"
              />
              <h1 className="text-4xl font-bold tracking-tight text-slate-200 sm:text-5xl">
                {profile.name}
              </h1>
              <h2 className="mt-3 text-lg font-medium tracking-tight text-slate-200 sm:text-xl">
                {profile.role}
              </h2>
              <p className="mt-4 max-w-xs leading-normal">{profile.tagline}</p>

              <nav className="hidden lg:block" aria-label="In-page navigation">
                <ul className="mt-16 w-max">
                  {NAV.map(({ id, label }) => {
                    const isActive = active === id;
                    return (
                      <li key={id}>
                        <a href={`#${id}`} className="group flex items-center py-3">
                          <span
                            className={`mr-4 h-px transition-all motion-reduce:transition-none ${
                              isActive
                                ? "w-16 bg-slate-200"
                                : "w-8 bg-slate-600 group-hover:w-16 group-hover:bg-slate-200"
                            }`}
                          />
                          <span
                            className={`text-xs font-bold uppercase tracking-widest ${
                              isActive
                                ? "text-slate-200"
                                : "text-slate-500 group-hover:text-slate-200"
                            }`}
                          >
                            {label}
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            <div className="mt-8 flex items-center gap-5">
              {socials.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-slate-400 transition-colors hover:text-slate-200"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
              <a
                href={profile.resumeUrl}
                download
                className="ml-2 inline-flex items-center gap-2 rounded-full border border-teal-300/30 px-4 py-1.5 text-sm font-medium text-teal-300 transition-colors hover:bg-teal-300/10"
              >
                <Download className="h-4 w-4" />
                Résumé
              </a>
            </div>
          </header>

          {/* Right / scrolling column */}
          <main className="pt-24 lg:w-1/2 lg:py-24">
            <section id="about" className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24">
              <SectionHeading>About</SectionHeading>
              <p className="text-[17px]">
                <RichText text={about} strongClassName="font-medium text-slate-200" />
              </p>
              {profile.availability && (
                <p className="mt-6 inline-flex items-center gap-2 text-sm text-slate-300">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
                  </span>
                  {profile.availability} · {profile.location}
                </p>
              )}
            </section>

            <section id="experience" className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24">
              <SectionHeading>Experience</SectionHeading>
              <ol className="group/list space-y-12">
                {experience.map((exp, i) => (
                  <li key={i}>
                    <HoverCard>
                      <header className="z-10 mb-2 mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:col-span-2">
                        {exp.date}
                      </header>
                      <div className="z-10 sm:col-span-6">
                        <h3 className="font-medium leading-snug text-slate-200">
                          {exp.title} · <span className="text-teal-300">{exp.company}</span>
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">{exp.location}</p>
                        {exp.responsibilities.length > 0 && (
                          <ul className="mt-2 space-y-1 text-sm leading-normal">
                            {exp.responsibilities.map((r, j) => (
                              <li key={j}>{r}</li>
                            ))}
                          </ul>
                        )}
                        {exp.skills.length > 0 && (
                          <ul className="mt-3 flex flex-wrap gap-2">
                            {exp.skills.map((s) => (
                              <Pill key={s}>{s}</Pill>
                            ))}
                          </ul>
                        )}
                      </div>
                    </HoverCard>
                  </li>
                ))}
              </ol>
              <a
                href={profile.resumeUrl}
                download
                className="group mt-12 inline-flex items-center gap-1 font-semibold text-slate-200"
              >
                <span className="border-b border-transparent pb-px transition group-hover:border-teal-300">
                  View Full Résumé
                </span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
              </a>
            </section>

            <section id="projects" className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24">
              <SectionHeading>Projects</SectionHeading>
              <ul className="group/list space-y-12">
                {projects.map((project) => (
                  <li key={project.name}>
                    <HoverCard href={project.demo ?? project.github}>
                      <div className="z-10 mb-2 mt-1 sm:col-span-2">
                        <div className="flex h-14 w-full max-w-[120px] items-center justify-center rounded border-2 border-slate-200/10 bg-gradient-to-br from-slate-800 to-slate-900 text-lg font-bold text-slate-500 transition group-hover:border-slate-200/30">
                          {project.name.match(/\b\w/g)?.slice(0, 2).join("")}
                        </div>
                      </div>
                      <div className="z-10 sm:col-span-6">
                        <h3 className="inline-flex items-baseline font-medium leading-tight text-slate-200 group-hover:text-teal-300">
                          {project.name}
                          <ArrowUpRight className="ml-1 h-4 w-4 flex-shrink-0 translate-y-px transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </h3>
                        <p className="mt-2 text-sm leading-normal">{project.description}</p>
                        <ul className="mt-2 list-disc space-y-1 pl-4 text-sm leading-normal text-slate-500 marker:text-slate-700">
                          {project.details.map((d, j) => (
                            <li key={j}>{d}</li>
                          ))}
                        </ul>
                        <ul className="mt-3 flex flex-wrap gap-2">
                          {project.technologies.map((t) => (
                            <Pill key={t}>{t}</Pill>
                          ))}
                        </ul>
                      </div>
                    </HoverCard>
                  </li>
                ))}
              </ul>
            </section>

            <section id="skills" className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24">
              <SectionHeading>Skills</SectionHeading>
              <div className="flex flex-wrap gap-2" role="tablist">
                {skills.map((s) => {
                  const selected = s.name === skill.name;
                  return (
                    <button
                      key={s.name}
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setSkill(s)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors ${
                        selected
                          ? "border-teal-300/50 bg-teal-400/10 text-teal-300"
                          : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                      }`}
                    >
                      <SkillIcon name={s.icon} className="h-3.5 w-3.5" />
                      {s.name}
                    </button>
                  );
                })}
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="mt-6 grid gap-3 sm:grid-cols-2"
                >
                  {skill.sites?.map((site) => (
                    <a
                      key={site.url}
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block rounded-lg border border-slate-800 bg-slate-900/40 p-4 transition-colors hover:border-teal-400/40"
                    >
                      <span className="flex items-center justify-between font-medium text-slate-200 group-hover:text-teal-300">
                        {site.title}
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                      <p className="mt-2 text-sm">{site.description}</p>
                    </a>
                  ))}
                  {skill.repos.map((repo) => (
                    <RepoTile key={repo} name={repo} />
                  ))}
                </motion.div>
              </AnimatePresence>

              <div className="mt-12 space-y-5">
                {tools.map((cat) => (
                  <div key={cat.name} className="sm:grid sm:grid-cols-8 sm:gap-4">
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:col-span-2 sm:mb-0 sm:pt-1">
                      {cat.name}
                    </h3>
                    <ul className="flex flex-wrap gap-2 sm:col-span-6">
                      {cat.skills.map((s) => (
                        <li key={s} className="rounded border border-slate-800 px-2 py-0.5 text-sm text-slate-300">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section id="credentials" className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24">
              <SectionHeading>Credentials</SectionHeading>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Education
              </h3>
              <ul className="mb-12 space-y-4">
                {education.map((edu) => (
                  <li key={edu.institution} className="sm:grid sm:grid-cols-8 sm:gap-4">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 sm:col-span-2 sm:pt-1">
                      {edu.period}
                    </span>
                    <div className="sm:col-span-6">
                      <p className="font-medium text-slate-200">{edu.institution}</p>
                      <p className="text-sm">
                        {edu.degree} · {edu.location}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Certifications
              </h3>
              <ul className="group/list space-y-1">
                {certifications.map((cert, i) => (
                  <li key={i}>
                    <a
                      href={cert.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={cert.description}
                      className="group flex items-center gap-4 rounded-md px-3 py-3 transition-all hover:bg-slate-800/50 lg:-mx-3 lg:group-hover/list:opacity-50 lg:hover:!opacity-100"
                    >
                      <SkillIcon name={cert.icon} className="h-4 w-4 flex-shrink-0 text-slate-500 group-hover:text-teal-300" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-slate-200 group-hover:text-teal-300">
                          {cert.name}
                        </span>
                        <span className="block text-xs text-slate-500">{cert.issuer}</span>
                      </span>
                      <span className="flex-shrink-0 text-xs tabular-nums text-slate-500">
                        {cert.date}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            <footer className="max-w-md pb-16 text-sm text-slate-500 sm:pb-0">
              Built with Next.js and Tailwind CSS. © {new Date().getFullYear()}{" "}
              {profile.name}.
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}

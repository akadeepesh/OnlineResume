"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Download,
  GitFork,
  Github,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Plus,
  Star,
  X,
} from "lucide-react";
import { Avatar } from "@/components/shared/Avatar";
import { RichText } from "@/components/shared/RichText";
import { SkillIcon } from "@/components/shared/SkillIcon";
import { repoUrl, useRepoData } from "@/lib/github";
import type { Resume, Skill } from "@/lib/resume/schema";
import {
  emailOf,
  firstName,
  has,
  joinParts,
  presentSections,
  socialLinks,
} from "@/lib/resume/view";

const SOCIAL_ICONS = { github: Github, linkedin: Linkedin, email: Mail } as const;

const workCount = (skill: Skill) => skill.repos.length + (skill.sites?.length ?? 0);

const Tile: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = "", delay = 0 }) => (
  <div
    style={{ animationDelay: `${delay}s` }}
    className={`relative animate-fade-up overflow-hidden rounded-[28px] p-6 sm:p-7 ${className}`}
  >
    {children}
  </div>
);

const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "text-neutral-400",
}) => (
  <p className={`mb-4 text-xs font-semibold uppercase tracking-[0.14em] ${className}`}>
    {children}
  </p>
);

const DrawerRepo: React.FC<{ name: string }> = ({ name }) => {
  const { data, loading } = useRepoData(name);
  return (
    <a
      href={repoUrl(name)}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-4 rounded-2xl bg-neutral-50 p-4 transition-colors hover:bg-neutral-100"
    >
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
        <Github className="h-5 w-5 text-neutral-700" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate font-semibold text-neutral-900">{name}</span>
          <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-neutral-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
        {loading && <span className="mt-2 block h-3 w-1/2 animate-pulse rounded bg-neutral-200" />}
        {data?.description && (
          <span className="mt-1 line-clamp-2 block text-sm text-neutral-500">
            {data.description}
          </span>
        )}
        {data && (
          <span className="mt-2 flex gap-3 text-xs font-medium text-neutral-500">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5" /> {data.stargazers_count}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="h-3.5 w-3.5" /> {data.forks_count}
            </span>
          </span>
        )}
      </span>
    </a>
  );
};

const SkillDrawer: React.FC<{ skill: Skill | null; onClose: () => void }> = ({
  skill,
  onClose,
}) => {
  useEffect(() => {
    if (!skill) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [skill, onClose]);

  return (
    <AnimatePresence>
      {skill && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-neutral-900/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={`${skill.name} projects`}
            className="fixed inset-y-2 right-2 z-50 flex w-[calc(100%-1rem)] max-w-md flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl"
            initial={{ x: "105%" }}
            animate={{ x: 0 }}
            exit={{ x: "105%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="flex items-center justify-between bg-[#ff5b2e] p-6 text-white">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20">
                  <SkillIcon name={skill.icon} className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
                    Built with
                  </p>
                  <h3 className="text-2xl font-semibold tracking-tight">{skill.name}</h3>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {skill.sites?.map((site, i) => (
                <a
                  key={i}
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-2xl bg-neutral-900 p-5 text-white"
                >
                  <span className="flex items-center justify-between text-lg font-semibold">
                    {site.title}
                    <ArrowUpRight className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                  {has(site.description) && (
                    <span className="mt-1 block text-sm text-neutral-400">{site.description}</span>
                  )}
                  {site.tags.length > 0 && (
                    <span className="mt-3 flex flex-wrap gap-1.5">
                      {site.tags.map((t) => (
                        <span key={t} className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs">
                          {t}
                        </span>
                      ))}
                    </span>
                  )}
                </a>
              ))}
              {skill.repos.map((repo) => (
                <DrawerRepo key={repo} name={repo} />
              ))}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default function BentoTemplate({ data }: { data: Resume }) {
  const { profile, about, experience, projects, skills, tools, education, certifications } =
    data;
  const show = presentSections(data);
  const [openExp, setOpenExp] = useState<number | null>(
    experience.findIndex((e) => e.responsibilities.length > 0)
  );
  const [skill, setSkill] = useState<Skill | null>(null);
  const closeDrawer = useCallback(() => setSkill(null), []);
  const greetingName = firstName(profile.name);
  const email = emailOf(data);
  const socials = socialLinks(profile.socials);

  // Only show counters that have something to count.
  const stats = [
    { value: experience.length, label: "Roles" },
    { value: projects.length + skills.reduce((n, s) => n + s.repos.length, 0), label: "Projects" },
    { value: skills.length, label: "Core skills" },
    { value: certifications.length, label: "Certificates" },
  ].filter((s) => s.value > 0);

  return (
    <div className="min-h-screen bg-[#efeeea] font-sans text-neutral-900 selection:bg-[#ff5b2e] selection:text-white">
      <div className="mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-10">
        <div className="grid auto-rows-auto grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Intro */}
          <Tile className="bg-white md:col-span-2 lg:row-span-2">
            <div className="flex h-full flex-col justify-between gap-8">
              <div className="flex items-start justify-between">
                <Avatar
                  src={profile.avatar}
                  name={profile.name}
                  size={80}
                  priority
                  className="rounded-[22px] bg-neutral-100"
                  fallbackClassName="text-[#ff5b2e]"
                />
                {has(profile.availability) && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]" />
                    {profile.availability}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-4xl font-semibold leading-[1.05] tracking-tighter sm:text-5xl lg:text-6xl">
                  Hi, I&apos;m {greetingName}.
                  {has(profile.role) && (
                    <>
                      <br />
                      <span className="text-neutral-400">{profile.role}.</span>
                    </>
                  )}
                </h1>
                {has(profile.tagline) && (
                  <p className="mt-4 max-w-md text-neutral-500">{profile.tagline}</p>
                )}
                {(email || has(profile.resumeUrl)) && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {email && (
                      <a
                        href={`mailto:${email}`}
                        className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
                      >
                        Get in touch <ArrowRight className="h-4 w-4" />
                      </a>
                    )}
                    {has(profile.resumeUrl) && (
                      <a
                        href={profile.resumeUrl}
                        download
                        className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-neutral-50"
                      >
                        <Download className="h-4 w-4" /> Résumé
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Tile>

          {/* Location */}
          {has(profile.location) && (
            <Tile className="min-h-[180px] bg-[#dfe7dc]" delay={0.05}>
              <div
                className="absolute inset-0 opacity-50"
                style={{
                  backgroundImage: "radial-gradient(#7d9a74 1.2px, transparent 1.2px)",
                  backgroundSize: "12px 12px",
                  maskImage: "radial-gradient(circle at 70% 30%, black, transparent 70%)",
                  WebkitMaskImage: "radial-gradient(circle at 70% 30%, black, transparent 70%)",
                }}
              />
              <div className="relative flex h-full flex-col justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                  <MapPin className="h-5 w-5 text-[#4f6b47]" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#4f6b47]/70">
                    Based in
                  </p>
                  <p className="text-xl font-semibold tracking-tight text-[#24321f]">
                    {profile.location}
                  </p>
                </div>
              </div>
            </Tile>
          )}

          {/* Socials */}
          {socials.length > 0 && (
            <Tile className="bg-white p-3 sm:p-3" delay={0.1}>
              <div className="flex h-full flex-col gap-1.5">
                {socials.map(({ kind, href, label }) => {
                  const Icon = SOCIAL_ICONS[kind];
                  return (
                    <a
                      key={kind}
                      href={href}
                      target={kind === "email" ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      className="group flex flex-1 items-center justify-between rounded-2xl bg-neutral-50 px-4 py-3 transition-colors hover:bg-neutral-900 hover:text-white"
                    >
                      <span className="flex items-center gap-3 font-medium">
                        <Icon className="h-4 w-4" /> {label}
                      </span>
                      <ArrowUpRight className="h-4 w-4 opacity-40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </a>
                  );
                })}
              </div>
            </Tile>
          )}

          {/* Stats */}
          {stats.length > 0 && (
            <Tile className="bg-neutral-900 text-white md:col-span-2" delay={0.15}>
              <div className="grid h-full grid-cols-2 gap-6 sm:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.label} className="flex flex-col justify-end">
                    <span className="text-4xl font-semibold tracking-tighter sm:text-5xl">
                      {s.value}
                      <span className="text-[#ff5b2e]">+</span>
                    </span>
                    <span className="mt-1 text-sm text-neutral-400">{s.label}</span>
                  </div>
                ))}
              </div>
            </Tile>
          )}

          {/* About */}
          {show.about && (
            <Tile className="bg-white md:col-span-2">
              <Label>About</Label>
              <p className="text-lg leading-relaxed text-neutral-500">
                <RichText text={about ?? ""} strongClassName="font-medium text-neutral-900" />
              </p>
            </Tile>
          )}

          {/* Skills */}
          {show.skills && (
            <Tile className="bg-[#ff5b2e] text-white md:col-span-2" delay={0.05}>
              <Label className="text-white/70">
                {skills.some((s) => workCount(s) > 0) ? "Skills — tap to see the work" : "Skills"}
              </Label>
              <div className="flex flex-wrap gap-2">
                {skills.map((s, i) =>
                  workCount(s) > 0 ? (
                    <button
                      key={i}
                      onClick={() => setSkill(s)}
                      className="group inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur transition-all hover:bg-white hover:text-[#ff5b2e]"
                    >
                      <SkillIcon name={s.icon} className="h-4 w-4" />
                      {s.name}
                      <span className="rounded-full bg-white/20 px-1.5 text-[11px] group-hover:bg-[#ff5b2e]/10">
                        {workCount(s)}
                      </span>
                    </button>
                  ) : (
                    <span
                      key={i}
                      className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium"
                    >
                      <SkillIcon name={s.icon} className="h-4 w-4" />
                      {s.name}
                    </span>
                  )
                )}
              </div>
            </Tile>
          )}

          {/* Experience */}
          {show.experience && (
            <Tile className="bg-white md:col-span-2 lg:row-span-2">
              <Label>Experience</Label>
              <ul className="divide-y divide-neutral-100">
                {experience.map((exp, i) => {
                  const open = openExp === i;
                  const expandable = exp.responsibilities.length > 0 || exp.skills.length > 0;
                  const where = joinParts([exp.company, exp.location]);
                  return (
                    <li key={i} className="py-4 first:pt-0">
                      <button
                        disabled={!expandable}
                        onClick={() => setOpenExp(open ? null : i)}
                        className="flex w-full items-start justify-between gap-4 text-left"
                        aria-expanded={expandable ? open : undefined}
                      >
                        <span>
                          <span className="block font-semibold tracking-tight">{exp.title}</span>
                          {where && <span className="block text-sm text-neutral-500">{where}</span>}
                        </span>
                        <span className="flex flex-shrink-0 items-center gap-3">
                          {has(exp.date) && (
                            <span className="hidden text-xs text-neutral-400 sm:block">{exp.date}</span>
                          )}
                          {expandable && (
                            <span
                              className={`flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 transition-transform ${
                                open ? "rotate-45 bg-neutral-900 text-white" : ""
                              }`}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </span>
                      </button>
                      {has(exp.date) && (
                        <p className="mt-1 text-xs text-neutral-400 sm:hidden">{exp.date}</p>
                      )}
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            {exp.responsibilities.length > 0 && (
                              <ul className="mt-3 space-y-1.5 text-sm text-neutral-600">
                                {exp.responsibilities.map((r, j) => (
                                  <li key={j} className="flex gap-2">
                                    <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#ff5b2e]" />
                                    <span>
                                      <RichText text={r} strongClassName="font-medium text-neutral-900" />
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                            {exp.skills.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {exp.skills.map((s) => (
                                  <span key={s} className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>
            </Tile>
          )}

          {/* Projects */}
          {projects.map((project, i) => {
            const dark = i % 3 === 0;
            return (
              <Tile
                key={i}
                delay={(i % 2) * 0.05}
                className={`group md:col-span-2 ${dark ? "bg-neutral-900 text-white" : "bg-white"}`}
              >
                <div className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <span className={`text-sm font-medium ${dark ? "text-neutral-500" : "text-neutral-400"}`}>
                      Project {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex gap-1.5">
                      {has(project.github) && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Source code"
                          className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                            dark ? "bg-white/10 hover:bg-white/20" : "bg-neutral-100 hover:bg-neutral-200"
                          }`}
                        >
                          <Github className="h-4 w-4" />
                        </a>
                      )}
                      {has(project.demo) && (
                        <a
                          href={project.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Live demo"
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ff5b2e] text-white transition-transform hover:scale-110"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold tracking-tight">
                    {project.name.replace(/^Project \w+ - /, "")}
                  </h3>
                  {has(project.description) && (
                    <p className={`mt-2 ${dark ? "text-neutral-400" : "text-neutral-500"}`}>
                      {project.description}
                    </p>
                  )}
                  {project.technologies.length > 0 && (
                    <div className="mt-auto flex flex-wrap gap-1.5 pt-6">
                      {project.technologies.map((t) => (
                        <span
                          key={t}
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            dark ? "bg-white/10 text-neutral-300" : "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Tile>
            );
          })}

          {/* Tools */}
          {show.tools && (
            <Tile className="bg-white md:col-span-2">
              <Label>Toolbox</Label>
              <div className="grid gap-5 sm:grid-cols-2">
                {tools.map((cat, i) => (
                  <div key={i}>
                    <p className="mb-2 text-sm font-semibold">{cat.name}</p>
                    {cat.skills.length > 0 && (
                      <p className="text-sm leading-relaxed text-neutral-500">{cat.skills.join(" · ")}</p>
                    )}
                  </div>
                ))}
              </div>
            </Tile>
          )}

          {/* Education */}
          {show.education && (
            <Tile className="bg-[#e6e2f5] md:col-span-2" delay={0.05}>
              <Label className="text-[#5b4b9a]/70">Education</Label>
              <div className="space-y-4">
                {education.map((edu, i) => {
                  const detail = joinParts([edu.degree, edu.location]);
                  return (
                    <div key={i} className="flex items-start gap-4">
                      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-[#5b4b9a] shadow-sm">
                        <GraduationCap className="h-5 w-5" />
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold tracking-tight text-[#231a45]">{edu.institution}</p>
                        {detail && <p className="text-sm text-[#231a45]/60">{detail}</p>}
                      </div>
                      {has(edu.period) && (
                        <span className="hidden text-xs font-medium text-[#231a45]/50 sm:block">
                          {edu.period}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Tile>
          )}

          {/* Certifications marquee */}
          {show.certifications && (
            <Tile className="bg-white px-0 sm:px-0 md:col-span-2 lg:col-span-4">
              <div className="px-6 sm:px-7">
                <Label>Certifications</Label>
              </div>
              <div className="group relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
                {[0, 1].map((copy) => (
                  <ul
                    key={copy}
                    aria-hidden={copy === 1}
                    className="flex flex-shrink-0 animate-marquee gap-3 pr-3 group-hover:[animation-play-state:paused]"
                  >
                    {certifications.map((cert, i) => {
                      const meta = joinParts([cert.issuer, cert.date]);
                      const className =
                        "flex w-64 items-center gap-3 rounded-2xl bg-neutral-50 p-4 transition-colors hover:bg-neutral-100";
                      const body = (
                        <>
                          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                            <SkillIcon name={cert.icon} className="h-5 w-5 text-[#ff5b2e]" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold">{cert.name}</span>
                            {meta && <span className="block text-xs text-neutral-500">{meta}</span>}
                          </span>
                        </>
                      );
                      return (
                        <li key={i}>
                          {has(cert.link) ? (
                            <a
                              href={cert.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              tabIndex={copy === 1 ? -1 : undefined}
                              title={cert.description}
                              className={className}
                            >
                              {body}
                            </a>
                          ) : (
                            <div title={cert.description} className={className}>
                              {body}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ))}
              </div>
            </Tile>
          )}

          {/* CTA */}
          {email && (
            <Tile className="bg-neutral-900 text-white md:col-span-2 lg:col-span-4">
              <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                <h2 className="text-3xl font-semibold tracking-tighter sm:text-4xl">
                  Let&apos;s build something <span className="text-[#ff5b2e]">together.</span>
                </h2>
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-neutral-900 transition-transform hover:scale-[1.03]"
                >
                  <Mail className="h-4 w-4" /> {email}
                </a>
              </div>
            </Tile>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-neutral-400">
          © {new Date().getFullYear()} {profile.name}
        </p>
      </div>

      <SkillDrawer skill={skill} onClose={closeDrawer} />
    </div>
  );
}

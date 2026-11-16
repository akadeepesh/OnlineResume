"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Download,
  Github,
  Linkedin,
  Mail,
} from "lucide-react";
import { Avatar } from "@/components/shared/Avatar";
import { RichText } from "@/components/shared/RichText";
import { SkillIcon } from "@/components/shared/SkillIcon";
import type { Resume, SectionKey, Skill } from "@/lib/resume/schema";
import { arrangeBlocks, has, initials, joinParts, presentSections, socialLinks, workForSkill } from "@/lib/resume/view";
import { renderBlocks } from "../blocks";

/** In-page nav: one link per block, ordered like the blocks themselves. */
const NAV = [
  { id: "about", label: "About", sections: ["about"] },
  { id: "experience", label: "Experience", sections: ["experience"] },
  { id: "projects", label: "Projects", sections: ["projects"] },
  { id: "skills", label: "Skills", sections: ["skills", "tools"] },
  { id: "credentials", label: "Credentials", sections: ["education", "certifications"] },
] as const satisfies readonly { id: string; label: string; sections: readonly SectionKey[] }[];

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

const SOCIAL_ICONS = { github: Github, linkedin: Linkedin, email: Mail } as const;

export default function SpotlightTemplate({ data }: { data: Resume }) {
  const { profile, about, experience, projects, skills, tools, education, certifications } =
    data;
  const show = presentSections(data);
  const status = joinParts([profile.availability, profile.location]);
  const nav = arrangeBlocks(
    data,
    NAV.filter(({ id }) =>
      id === "about"
        ? show.about || status !== ""
        : id === "skills"
        ? show.skills || show.tools
        : id === "credentials"
          ? show.education || show.certifications
          : show[id]
    )
  );
  const navKey = nav.map((n) => n.id).join(",");

  const [active, setActive] = useState<string>(nav[0]?.id ?? "");
  // May be undefined: a resume can have no skills at all.
  const [skill, setSkill] = useState<Skill | undefined>(skills[0]);
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
    navKey.split(",").forEach((id) => {
      const el = id && document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [navKey]);

  const socials = socialLinks(profile.socials);
  const work = skill ? workForSkill(data, skill) : [];

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
              <Avatar
                src={profile.avatar}
                name={profile.name}
                size={72}
                priority
                className="mb-6 rounded-full ring-2 ring-slate-700/60"
                fallbackClassName="bg-slate-800 text-teal-300"
              />
              <h1 className="text-4xl font-bold tracking-tight text-slate-200 sm:text-5xl">
                {profile.name}
              </h1>
              {has(profile.role) && (
                <h2 className="mt-3 text-lg font-medium tracking-tight text-slate-200 sm:text-xl">
                  {profile.role}
                </h2>
              )}
              {has(profile.tagline) && (
                <p className="mt-4 max-w-xs leading-normal">{profile.tagline}</p>
              )}

              {nav.length > 1 && (
                <nav className="hidden lg:block" aria-label="In-page navigation">
                  <ul className="mt-16 w-max">
                    {nav.map(({ id, label }) => {
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
              )}
            </div>

            {(socials.length > 0 || has(profile.resumeUrl)) && (
              <div className="mt-8 flex items-center gap-5">
                {socials.map(({ kind, href, label }) => {
                  const Icon = SOCIAL_ICONS[kind];
                  return (
                    <a
                      key={kind}
                      href={href}
                      target={kind === "email" ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="text-slate-400 transition-colors hover:text-slate-200"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
                {has(profile.resumeUrl) && (
                  <a
                    href={profile.resumeUrl}
                    download
                    className={`${socials.length > 0 ? "ml-2" : ""} inline-flex items-center gap-2 rounded-full border border-teal-300/30 px-4 py-1.5 text-sm font-medium text-teal-300 transition-colors hover:bg-teal-300/10`}
                  >
                    <Download className="h-4 w-4" />
                    Résumé
                  </a>
                )}
              </div>
            )}
          </header>

          {/* Right / scrolling column */}
          <main className="pt-24 lg:w-1/2 lg:py-24">
            {renderBlocks(data, [
              (show.about || status !== "") && {
                id: "about",
                sections: ["about"],
                render: () => (
                  <section id="about" className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24">
                    <SectionHeading>About</SectionHeading>
                    {show.about && (
                      <p className="text-[17px]">
                        <RichText text={about ?? ""} strongClassName="font-medium text-slate-200" />
                      </p>
                    )}
                    {status && (
                      <p className={`${show.about ? "mt-6" : ""} inline-flex items-center gap-2 text-sm text-slate-300`}>
                        {has(profile.availability) && (
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-60" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
                          </span>
                        )}
                        {status}
                      </p>
                    )}
                  </section>
                ),
              },

              show.experience && {
                id: "experience",
                sections: ["experience"],
                render: () => (
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
                                {exp.title}
                                {has(exp.company) && (
                                  <>
                                    {" · "}
                                    <span className="text-teal-300">{exp.company}</span>
                                  </>
                                )}
                              </h3>
                              {has(exp.location) && (
                                <p className="mt-1 text-sm text-slate-500">{exp.location}</p>
                              )}
                              {exp.responsibilities.length > 0 && (
                                <ul className="mt-2 space-y-1 text-sm leading-normal">
                                  {exp.responsibilities.map((r, j) => (
                                    <li key={j}>
                                      <RichText text={r} strongClassName="font-medium text-slate-200" />
                                    </li>
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
                    {has(profile.resumeUrl) && (
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
                    )}
                  </section>
                ),
              },

              show.projects && {
                id: "projects",
                sections: ["projects"],
                render: () => (
                  <section id="projects" className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24">
                    <SectionHeading>Projects</SectionHeading>
                    <ul className="group/list space-y-12">
                      {projects.map((project, i) => {
                        const href = has(project.demo)
                          ? project.demo
                          : has(project.github)
                            ? project.github
                            : undefined;
                        return (
                          <li key={i}>
                            <HoverCard href={href}>
                              <div className="z-10 mb-2 mt-1 sm:col-span-2">
                                <div className="flex h-14 w-full max-w-[120px] items-center justify-center rounded border-2 border-slate-200/10 bg-gradient-to-br from-slate-800 to-slate-900 text-lg font-bold text-slate-500 transition group-hover:border-slate-200/30">
                                  {initials(project.name)}
                                </div>
                              </div>
                              <div className="z-10 sm:col-span-6">
                                <h3 className="inline-flex items-baseline font-medium leading-tight text-slate-200 group-hover:text-teal-300">
                                  {project.name}
                                  {href && (
                                    <ArrowUpRight className="ml-1 h-4 w-4 flex-shrink-0 translate-y-px transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                  )}
                                </h3>
                                {has(project.description) && (
                                  <p className="mt-2 text-sm leading-normal">{project.description}</p>
                                )}
                                {project.details.length > 0 && (
                                  <ul className="mt-2 list-disc space-y-1 pl-4 text-sm leading-normal text-slate-500 marker:text-slate-700">
                                    {project.details.map((d, j) => (
                                      <li key={j}>
                                        <RichText text={d} strongClassName="font-medium text-slate-200" />
                                      </li>
                                    ))}
                                  </ul>
                                )}
                                {project.technologies.length > 0 && (
                                  <ul className="mt-3 flex flex-wrap gap-2">
                                    {project.technologies.map((t) => (
                                      <Pill key={t}>{t}</Pill>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </HoverCard>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ),
              },

              (show.skills || show.tools) && {
                id: "skills",
                sections: ["skills", "tools"],
                render: () => (
                  <section id="skills" className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24">
                    <SectionHeading>Skills</SectionHeading>
                    {renderBlocks(data, [
                      show.skills && {
                        id: "skills",
                        sections: ["skills"],
                        render: (inner) => (
                          <div className={inner > 0 ? "mt-12" : ""}>
                              <div className="flex flex-wrap gap-2" role="tablist">
                                {skills.map((s, i) => {
                                  const selected = s.name === skill?.name;
                                  return (
                                    <button
                                      key={i}
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
                              {skill && work.length > 0 && (
                                <motion.div
                                  key={skill.name}
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -8 }}
                                  transition={{ duration: 0.2 }}
                                  className="mt-6 grid gap-3 sm:grid-cols-2"
                                >
                                  {work.map((item, i) => {
                                    const body = (
                                      <>
                                        <span className="flex items-center justify-between font-medium text-slate-200 group-hover:text-teal-300">
                                          {item.title}
                                          {item.href && <ArrowUpRight className="h-4 w-4" />}
                                        </span>
                                        {has(item.description) && <p className="mt-2 text-sm">{item.description}</p>}
                                      </>
                                    );
                                    const className =
                                      "group block rounded-lg border border-slate-800 bg-slate-900/40 p-4 transition-colors hover:border-teal-400/40";
                                    return item.href ? (
                                      <a key={i} href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
                                        {body}
                                      </a>
                                    ) : (
                                      <div key={i} className={className}>
                                        {body}
                                      </div>
                                    );
                                  })}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ),
                      },
                      show.tools && {
                        id: "tools",
                        sections: ["tools"],
                        render: (inner) => (
                          <div className={inner > 0 ? "mt-12" : ""}>
                            <div className="space-y-5">
                              {tools.map((cat, i) => (
                                <div key={i} className="sm:grid sm:grid-cols-8 sm:gap-4">
                                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:col-span-2 sm:mb-0 sm:pt-1">
                                    {cat.name}
                                  </h3>
                                  {cat.skills.length > 0 && (
                                    <ul className="flex flex-wrap gap-2 sm:col-span-6">
                                      {cat.skills.map((s) => (
                                        <li key={s} className="rounded border border-slate-800 px-2 py-0.5 text-sm text-slate-300">
                                          {s}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ),
                      },
                    ])}
                  </section>
                ),
              },

              (show.education || show.certifications) && {
                id: "credentials",
                sections: ["education", "certifications"],
                render: () => (
                  <section id="credentials" className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24">
                    <SectionHeading>Credentials</SectionHeading>
                    {renderBlocks(data, [
                      show.education && {
                        id: "education",
                        sections: ["education"],
                        render: (inner) => (
                          <div className={inner > 0 ? "mt-12" : ""}>
                            <>
                              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
                                Education
                              </h3>
                              <ul className="space-y-4">
                                {education.map((edu, i) => {
                                  const detail = joinParts([edu.degree, edu.location]);
                                  return (
                                    <li key={i} className="sm:grid sm:grid-cols-8 sm:gap-4">
                                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 sm:col-span-2 sm:pt-1">
                                        {edu.period}
                                      </span>
                                      <div className="sm:col-span-6">
                                        <p className="font-medium text-slate-200">{edu.institution}</p>
                                        {detail && <p className="text-sm">{detail}</p>}
                                      </div>
                                    </li>
                                  );
                                })}
                              </ul>
                            </>
                          </div>
                        ),
                      },
                      show.certifications && {
                        id: "certifications",
                        sections: ["certifications"],
                        render: (inner) => (
                          <div className={inner > 0 ? "mt-12" : ""}>
                            <>
                              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
                                Certifications
                              </h3>
                              <ul className="group/list space-y-1">
                                {certifications.map((cert, i) => {
                                  const className =
                                    "group flex items-center gap-4 rounded-md px-3 py-3 transition-all hover:bg-slate-800/50 lg:-mx-3 lg:group-hover/list:opacity-50 lg:hover:!opacity-100";
                                  const body = (
                                    <>
                                      <SkillIcon name={cert.icon} className="h-4 w-4 flex-shrink-0 text-slate-500 group-hover:text-teal-300" />
                                      <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-medium text-slate-200 group-hover:text-teal-300">
                                          {cert.name}
                                        </span>
                                        {has(cert.issuer) && (
                                          <span className="block text-xs text-slate-500">{cert.issuer}</span>
                                        )}
                                      </span>
                                      {has(cert.date) && (
                                        <span className="flex-shrink-0 text-xs tabular-nums text-slate-500">
                                          {cert.date}
                                        </span>
                                      )}
                                    </>
                                  );
                                  return (
                                    <li key={i}>
                                      {has(cert.link) ? (
                                        <a
                                          href={cert.link}
                                          target="_blank"
                                          rel="noopener noreferrer"
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
                            </>
                          </div>
                        ),
                      },
                    ])}
                  </section>
                ),
              },

            ])}
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

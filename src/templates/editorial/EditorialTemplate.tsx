"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RichText } from "@/components/shared/RichText";
import { repoUrl, useRepoData } from "@/lib/github";
import type { Resume, Skill } from "@/data/resume";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

const Section: React.FC<{
  index: number;
  title: string;
  children: React.ReactNode;
}> = ({ index, title, children }) => (
  <section className="grid gap-4 border-t border-stone-900/15 py-10 md:grid-cols-[200px_1fr] md:gap-10 md:py-14 print:break-inside-avoid print:py-6">
    <h2 className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8b2c24]">
      <span className="mr-2 font-serif text-sm normal-case italic tracking-normal text-stone-400">
        {ROMAN[index]}.
      </span>
      {title}
    </h2>
    <div>{children}</div>
  </section>
);

const ArrowLink: React.FC<{ href: string; children: React.ReactNode }> = ({
  href,
  children,
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-900 underline decoration-stone-900/30 underline-offset-4 transition-colors hover:text-[#8b2c24] hover:decoration-[#8b2c24]"
  >
    {children} ↗︎
  </a>
);

/** One repository rendered as a line with a dotted leader to its star count. */
const RepoLine: React.FC<{ name: string }> = ({ name }) => {
  const { data, loading } = useRepoData(name);
  return (
    <li>
      <a
        href={repoUrl(name)}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-baseline gap-2 py-1.5"
      >
        <span className="font-serif text-lg text-stone-900 group-hover:text-[#8b2c24]">
          {name}
        </span>
        <span className="flex-1 translate-y-[-3px] border-b border-dotted border-stone-400" />
        <span className="font-sans text-xs tabular-nums text-stone-500">
          {loading ? "…" : data ? `★ ${data.stargazers_count}` : "↗︎"}
        </span>
      </a>
      {data?.description && (
        <p className="-mt-0.5 mb-1 text-sm italic text-stone-500">
          {data.description}
        </p>
      )}
    </li>
  );
};

const SkillPanel: React.FC<{ skill: Skill }> = ({ skill }) => (
  <motion.div
    key={skill.name}
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: "auto" }}
    exit={{ opacity: 0, height: 0 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className="overflow-hidden"
  >
    <div className="mt-6 border-l-2 border-[#8b2c24] pl-5">
      <p className="mb-2 font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
        Work in {skill.name}
      </p>
      {skill.sites && skill.sites.length > 0 && (
        <ul className="mb-2">
          {skill.sites.map((site) => (
            <li key={site.url} className="py-1.5">
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-baseline gap-2"
              >
                <span className="font-serif text-lg text-stone-900 group-hover:text-[#8b2c24]">
                  {site.title}
                </span>
                <span className="flex-1 translate-y-[-3px] border-b border-dotted border-stone-400" />
                <span className="font-sans text-xs text-stone-500">site ↗︎</span>
              </a>
              <p className="text-sm italic text-stone-500">{site.description}</p>
            </li>
          ))}
        </ul>
      )}
      <ul>
        {skill.repos.map((repo) => (
          <RepoLine key={repo} name={repo} />
        ))}
      </ul>
    </div>
  </motion.div>
);

export default function EditorialTemplate({ data }: { data: Resume }) {
  const { profile, about, experience, projects, skills, tools, education, certifications } =
    data;
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);
  const year = new Date().getFullYear();

  let section = 0;

  return (
    <div className="min-h-screen bg-[#f6f3ec] text-stone-800 selection:bg-[#8b2c24] selection:text-white print:bg-white">
      <div className="mx-auto max-w-5xl px-6 sm:px-10">
        {/* Masthead */}
        <div className="flex items-center justify-between border-b border-stone-900 py-4 font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-900">
          <span>Curriculum Vitæ</span>
          <span className="hidden sm:inline">{profile.location}</span>
          <a
            href={profile.resumeUrl}
            download
            className="underline decoration-stone-900/30 underline-offset-4 hover:text-[#8b2c24] print:hidden"
          >
            PDF ↓
          </a>
        </div>

        {/* Title */}
        <header className="py-16 md:py-24">
          <h1
            className="animate-fade-up font-serif text-6xl font-light leading-[0.95] tracking-tight text-stone-950 sm:text-7xl md:text-8xl"
          >
            {profile.name.split(" ").map((part, i, arr) => (
              <React.Fragment key={i}>
                {i === arr.length - 1 ? <em className="font-normal">{part}</em> : part}
                {i < arr.length - 1 && <br className="hidden sm:block" />}
                {i < arr.length - 1 && " "}
              </React.Fragment>
            ))}
          </h1>
          <div
            style={{ animationDelay: "0.15s" }}
            className="mt-8 animate-fade-up grid gap-6 md:grid-cols-[1fr_auto] md:items-end"
          >
            <p className="max-w-xl font-serif text-xl italic leading-snug text-stone-600 md:text-2xl">
              {profile.role} — {profile.tagline}
            </p>
            <ul className="space-y-1 font-sans text-sm text-stone-600 md:text-right">
              <li>
                <a href={`mailto:${profile.socials.email}`} className="hover:text-[#8b2c24]">
                  {profile.socials.email}
                </a>
              </li>
              <li>
                <a href={profile.socials.github} target="_blank" rel="noopener noreferrer" className="hover:text-[#8b2c24]">
                  {profile.socials.github.replace(/^https?:\/\/(www\.)?/, "")}
                </a>
              </li>
              <li>
                <a href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-[#8b2c24]">
                  {profile.socials.linkedin.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                </a>
              </li>
            </ul>
          </div>
        </header>

        <Section index={section++} title="Profile">
          <p className="font-serif text-xl leading-relaxed text-stone-700 first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-serif first-letter:text-7xl first-letter:font-normal first-letter:leading-[0.8] first-letter:text-[#8b2c24] md:text-[22px]">
            <RichText text={about} strongClassName="font-medium text-stone-950" />
          </p>
        </Section>

        <Section index={section++} title="Experience">
          <div className="space-y-10">
            {experience.map((exp, i) => (
              <article key={i} className="grid gap-1 sm:grid-cols-[150px_1fr] sm:gap-6">
                <p className="pt-1.5 font-sans text-xs uppercase tracking-[0.12em] text-stone-500">
                  {exp.date}
                </p>
                <div>
                  <h3 className="font-serif text-2xl text-stone-950">{exp.title}</h3>
                  <p className="font-serif text-lg italic text-stone-600">
                    {exp.company}, {exp.location}
                  </p>
                  {exp.responsibilities.length > 0 && (
                    <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-stone-700">
                      {exp.responsibilities.map((r, j) => (
                        <li key={j} className="relative pl-5">
                          <span className="absolute left-0 text-stone-400">—</span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  )}
                  {exp.skills.length > 0 && (
                    <p className="mt-3 font-sans text-[11px] uppercase tracking-[0.14em] text-stone-500">
                      {exp.skills.join(" · ")}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </Section>

        <Section index={section++} title="Selected Work">
          <div className="space-y-12">
            {projects.map((project, i) => (
              <article key={project.name} className="grid gap-2 sm:grid-cols-[64px_1fr]">
                <span className="font-serif text-4xl font-light italic text-[#8b2c24]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-serif text-2xl text-stone-950">{project.name}</h3>
                  <p className="mt-1 font-serif text-lg italic text-stone-600">
                    {project.description}
                  </p>
                  <ul className="mt-3 space-y-1.5 text-[15px] leading-relaxed text-stone-700">
                    {project.details.map((d, j) => (
                      <li key={j} className="relative pl-5">
                        <span className="absolute left-0 text-stone-400">—</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                    <p className="font-sans text-[11px] uppercase tracking-[0.14em] text-stone-500">
                      {project.technologies.join(" · ")}
                    </p>
                    <div className="flex gap-4 print:hidden">
                      <ArrowLink href={project.github}>Source</ArrowLink>
                      {project.demo && <ArrowLink href={project.demo}>Live</ArrowLink>}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Section>

        <Section index={section++} title="Expertise">
          <p className="mb-5 font-serif text-lg italic text-stone-500 print:hidden">
            Select a discipline to read the related work.
          </p>
          <div className="flex flex-wrap gap-x-1 gap-y-2 font-serif text-2xl leading-snug md:text-3xl">
            {skills.map((skill, i) => {
              const active = activeSkill?.name === skill.name;
              return (
                <React.Fragment key={skill.name}>
                  <button
                    onClick={() => setActiveSkill(active ? null : skill)}
                    className={`transition-colors ${
                      active
                        ? "italic text-[#8b2c24] underline decoration-1 underline-offset-[6px]"
                        : "text-stone-900 hover:text-[#8b2c24]"
                    }`}
                  >
                    {skill.name}
                  </button>
                  {i < skills.length - 1 && <span className="text-stone-300">,</span>}
                </React.Fragment>
              );
            })}
          </div>
          <AnimatePresence mode="wait">
            {activeSkill && <SkillPanel key={activeSkill.name} skill={activeSkill} />}
          </AnimatePresence>

          <dl className="mt-10 grid gap-x-10 gap-y-5 sm:grid-cols-2">
            {tools.map((cat) => (
              <div key={cat.name}>
                <dt className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                  {cat.name}
                </dt>
                <dd className="mt-1 font-serif text-lg text-stone-800">
                  {cat.skills.join(", ")}
                </dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section index={section++} title="Education">
          <div className="space-y-6">
            {education.map((edu) => (
              <article key={edu.institution} className="grid gap-1 sm:grid-cols-[150px_1fr] sm:gap-6">
                <p className="pt-1.5 font-sans text-xs uppercase tracking-[0.12em] text-stone-500">
                  {edu.period}
                </p>
                <div>
                  <h3 className="font-serif text-2xl text-stone-950">{edu.institution}</h3>
                  <p className="font-serif text-lg italic text-stone-600">
                    {edu.degree}, {edu.location}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </Section>

        <Section index={section++} title="Honours">
          <ul className="grid gap-x-10 sm:grid-cols-2">
            {certifications.map((cert, i) => (
              <li key={i} className="border-b border-stone-900/10 py-3">
                <a
                  href={cert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={cert.description}
                  className="group block"
                >
                  <span className="font-serif text-lg leading-tight text-stone-900 group-hover:text-[#8b2c24]">
                    {cert.name}
                  </span>
                  <span className="mt-0.5 flex justify-between font-sans text-xs uppercase tracking-[0.12em] text-stone-500">
                    <span>{cert.issuer}</span>
                    <span className="tabular-nums">{cert.date}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Section>

        <footer className="flex flex-col justify-between gap-2 border-t border-stone-900 py-6 font-sans text-[11px] uppercase tracking-[0.22em] text-stone-500 sm:flex-row">
          <span>© {year} {profile.name}</span>
          <span className="italic normal-case tracking-normal font-serif text-sm">
            Set in Newsreader &amp; Inter
          </span>
        </footer>
      </div>
    </div>
  );
}

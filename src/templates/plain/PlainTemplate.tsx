import type { ReactNode } from "react";
import { RichText } from "@/components/shared/RichText";
import type { Resume } from "@/lib/resume/schema";
import { displayUrl, has, joinParts, presentSections, safeHref, socialLinks } from "@/lib/resume/view";
import { renderBlocks } from "../blocks";

// ============================================================================
// Plain: a single-column, ATS-friendly resume that prints cleanly.
//
// Applicant tracking systems read text in order and trip over columns, icons
// and images, so this template has none of them: real headings, plain lists,
// black on white. It's also what "Download PDF" uses for templates that are
// made for screens.
// ============================================================================

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6 break-inside-avoid-page first:mt-0">
      <h2 className="border-b border-neutral-300 pb-1 text-xs font-bold uppercase tracking-[0.12em] text-neutral-900">
        {title}
      </h2>
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  );
}

function Entry({
  heading,
  meta,
  sub,
  children,
}: {
  heading: ReactNode;
  meta?: string;
  sub?: string;
  children?: ReactNode;
}) {
  return (
    <div className="break-inside-avoid">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <h3 className="font-semibold text-neutral-900">{heading}</h3>
        {has(meta) && <p className="text-sm text-neutral-600">{meta}</p>}
      </div>
      {has(sub) && <p className="text-sm text-neutral-700">{sub}</p>}
      {children}
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  const shown = items.filter(has);
  if (shown.length === 0) return null;
  return (
    <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm leading-relaxed text-neutral-800">
      {shown.map((item, i) => (
        <li key={i}>
          <RichText text={item} />
        </li>
      ))}
    </ul>
  );
}

function ExternalLink({ value }: { value: string | undefined }) {
  const href = safeHref(value);
  if (!href || !value) return null;
  return (
    <a href={href} className="text-sm text-neutral-700 underline underline-offset-2">
      {displayUrl(href)}
    </a>
  );
}

export default function PlainTemplate({ data }: { data: Resume }) {
  const { profile } = data;
  const show = presentSections(data);
  const links = socialLinks(profile.socials, ["email", "linkedin", "github"]);
  const headline = joinParts([profile.role, profile.location]);

  return (
    <div className="min-h-screen bg-white text-neutral-900 print:min-h-0">
      <article className="mx-auto max-w-[800px] px-8 py-12 font-sans print:max-w-none print:p-0">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">{profile.name}</h1>
          {has(headline) && <p className="mt-1 text-base text-neutral-700">{headline}</p>}
          {links.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-neutral-700">
              {links.map((link) => (
                <li key={link.kind}>
                  <a href={link.href} className="underline underline-offset-2">
                    {link.display}
                  </a>
                </li>
              ))}
            </ul>
          )}
          {has(profile.tagline) && <p className="mt-3 text-sm italic text-neutral-700">{profile.tagline}</p>}
        </header>

        <div className="mt-8">
          {renderBlocks(data, [
            show.about && {
              id: "about",
              sections: ["about"],
              render: () => (
                <Section title="Summary">
                  <p className="text-sm leading-relaxed text-neutral-800">
                    <RichText text={data.about!} />
                  </p>
                </Section>
              ),
            },
            show.experience && {
              id: "experience",
              sections: ["experience"],
              render: () => (
                <Section title="Experience">
                  {data.experience.map((job, i) => (
                    <Entry
                      key={i}
                      heading={joinParts([job.title, job.company], ", ")}
                      meta={joinParts([job.date, job.location])}
                    >
                      <Bullets items={job.responsibilities} />
                    </Entry>
                  ))}
                </Section>
              ),
            },
            show.education && {
              id: "education",
              sections: ["education"],
              render: () => (
                <Section title="Education">
                  {data.education.map((school, i) => (
                    <Entry
                      key={i}
                      heading={school.institution}
                      meta={joinParts([school.period, school.location])}
                      sub={school.degree}
                    />
                  ))}
                </Section>
              ),
            },
            show.projects && {
              id: "projects",
              sections: ["projects"],
              render: () => (
                <Section title="Projects">
                  {data.projects.map((project, i) => (
                    <Entry key={i} heading={project.name} sub={project.technologies.filter(has).join(", ")}>
                      {has(project.description) && (
                        <p className="mt-1 text-sm leading-relaxed text-neutral-800">{project.description}</p>
                      )}
                      <Bullets items={project.details} />
                      {(safeHref(project.demo) || safeHref(project.github)) && (
                        <p className="mt-1 flex flex-wrap gap-x-4">
                          <ExternalLink value={project.demo} />
                          <ExternalLink value={project.github} />
                        </p>
                      )}
                    </Entry>
                  ))}
                </Section>
              ),
            },
            show.skills && {
              id: "skills",
              sections: ["skills"],
              render: () => (
                <Section title="Skills">
                  <p className="text-sm leading-relaxed text-neutral-800">
                    {data.skills.map((skill) => skill.name).filter(has).join(", ")}
                  </p>
                </Section>
              ),
            },
            show.tools && {
              id: "tools",
              sections: ["tools"],
              render: () => (
                <Section title="Tools">
                  <ul className="space-y-1 text-sm text-neutral-800">
                    {data.tools.map((group, i) => {
                      const items = group.skills.filter(has).join(", ");
                      return (
                        <li key={i}>
                          <span className="font-semibold">{group.name}</span>
                          {has(items) && <span>: {items}</span>}
                        </li>
                      );
                    })}
                  </ul>
                </Section>
              ),
            },
            show.certifications && {
              id: "certifications",
              sections: ["certifications"],
              render: () => (
                <Section title="Certifications">
                  {data.certifications.map((cert, i) => (
                    <Entry key={i} heading={cert.name} meta={cert.date} sub={cert.issuer}>
                      {has(cert.description) && (
                        <p className="mt-1 text-sm leading-relaxed text-neutral-800">{cert.description}</p>
                      )}
                      {safeHref(cert.link) && (
                        <p className="mt-1">
                          <ExternalLink value={cert.link} />
                        </p>
                      )}
                    </Entry>
                  ))}
                </Section>
              ),
            },
          ])}
        </div>
      </article>
    </div>
  );
}

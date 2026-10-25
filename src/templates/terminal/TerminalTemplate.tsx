"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { plainText } from "@/components/shared/RichText";
import { repoUrl, useRepoData } from "@/lib/github";
import type { Resume } from "@/data/resume";

// GitHub-dark inspired palette
const c = {
  green: "text-[#7ee787]",
  blue: "text-[#79c0ff]",
  purple: "text-[#d2a8ff]",
  orange: "text-[#ffa657]",
  red: "text-[#ff7b72]",
  string: "text-[#a5d6ff]",
  muted: "text-[#8b949e]",
  fg: "text-[#c9d1d9]",
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const Link: React.FC<{ href: string; children: React.ReactNode; className?: string }> = ({
  href,
  children,
  className = c.blue,
}) => (
  <a
    href={href}
    target={href.startsWith("mailto:") ? undefined : "_blank"}
    rel="noopener noreferrer"
    className={`${className} underline decoration-dotted underline-offset-4 hover:bg-[#79c0ff]/10`}
  >
    {children}
  </a>
);

const RepoRow: React.FC<{ name: string }> = ({ name }) => {
  const { data, loading } = useRepoData(name);
  return (
    <div className="flex flex-wrap gap-x-3">
      <span className={`w-20 flex-shrink-0 ${c.orange}`}>
        {loading ? "  …" : data ? `★${String(data.stargazers_count).padStart(3)} ⑂${data.forks_count}` : "  --"}
      </span>
      <Link href={repoUrl(name)}>{name}</Link>
      {data?.description && <span className={c.muted}># {data.description}</span>}
    </div>
  );
};

/** JSON-ish pretty printer with syntax colours. */
const Json: React.FC<{ value: unknown; indent?: number }> = ({ value, indent = 0 }) => {
  const pad = "  ".repeat(indent);
  if (Array.isArray(value)) {
    return (
      <>
        {"["}
        {"\n"}
        {value.map((v, i) => (
          <React.Fragment key={i}>
            {pad}
            {"  "}
            <Json value={v} indent={indent + 1} />
            {i < value.length - 1 ? "," : ""}
            {"\n"}
          </React.Fragment>
        ))}
        {pad}
        {"]"}
      </>
    );
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value);
    return (
      <>
        {"{"}
        {"\n"}
        {entries.map(([k, v], i) => (
          <React.Fragment key={k}>
            {pad}
            {"  "}
            <span className={c.blue}>&quot;{k}&quot;</span>: <Json value={v} indent={indent + 1} />
            {i < entries.length - 1 ? "," : ""}
            {"\n"}
          </React.Fragment>
        ))}
        {pad}
        {"}"}
      </>
    );
  }
  return <span className={c.string}>&quot;{String(value)}&quot;</span>;
};

type Entry = { id: number; cmd: string; output: React.ReactNode };

export default function TerminalTemplate({ data }: { data: Resume }) {
  const { profile, about, experience, projects, skills, tools, education, certifications } =
    data;
  const handle = slug(profile.name.split(" ")[0]);
  const host = "resume";

  const [input, setInput] = useState("");
  const [past, setPast] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const [loginDate, setLoginDate] = useState<string | null>(null);
  useEffect(() => setLoginDate(new Date().toDateString()), []);

  // ---- command implementations --------------------------------------------
  const commands = useMemo(() => {
    const skillNames = skills.map((s) => s.name);

    const help = () => (
      <div className="grid grid-cols-[auto_1fr] gap-x-6">
        {(
          [
            ["whoami", "who is this person"],
            ["about", "short bio"],
            ["experience", "work history"],
            ["projects", "selected projects"],
            ["skills [name]", "list skills, or show repos for one"],
            ["tools", "tooling & platforms"],
            ["education", "degrees"],
            ["certs", "certifications"],
            ["contact", "ways to reach me"],
            ["resume", "download the PDF résumé"],
            ["history", "previous commands"],
            ["clear", "clear the screen"],
          ] as const
        ).map(([cmd, desc]) => (
          <React.Fragment key={cmd}>
            <span className={c.green}>{cmd}</span>
            <span className={c.muted}>{desc}</span>
          </React.Fragment>
        ))}
      </div>
    );

    const whoami = () => (
      <div>
        <p className={`text-2xl font-bold sm:text-4xl ${c.green}`}>{profile.name}</p>
        <p className={`mt-1 ${c.purple}`}>{profile.role}</p>
        <p className={c.muted}>
          {profile.tagline} · {profile.location}
        </p>
        {profile.availability && (
          <p className="mt-2">
            <span className={c.green}>●</span> {profile.availability}
          </p>
        )}
      </div>
    );

    const aboutCmd = () => (
      <p className="max-w-3xl whitespace-pre-wrap">
        <span className={c.muted}># About{"\n\n"}</span>
        {plainText(about)}
      </p>
    );

    const experienceCmd = () => (
      <div className="space-y-4">
        <p className={c.muted}>total {experience.length}</p>
        {experience.map((exp, i) => (
          <div key={i}>
            <p className="flex flex-wrap gap-x-3">
              <span className={`${c.muted} sm:w-56`}>{exp.date}</span>
              <span>
                <span className={`font-bold ${c.blue}`}>{exp.title}</span>
                <span className={c.muted}> @ </span>
                <span className={c.orange}>{exp.company}</span>
                <span className={c.muted}> — {exp.location}</span>
              </span>
            </p>
            <div className="sm:pl-[15.75rem]">
              {exp.responsibilities.map((r, j) => (
                <p key={j} className="flex gap-2">
                  <span className={c.muted}>
                    {j === exp.responsibilities.length - 1 ? "└─" : "├─"}
                  </span>
                  <span>{r}</span>
                </p>
              ))}
              {exp.skills.length > 0 && (
                <p className={`mt-1 ${c.purple}`}>
                  {exp.skills.map((s) => `[${s}]`).join(" ")}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );

    const projectsCmd = () => (
      <div className="space-y-4">
        {projects.map((p) => (
          <div key={p.name}>
            <p>
              <span className={c.muted}>drwxr-xr-x </span>
              <span className={`font-bold ${c.blue}`}>{slug(p.name)}/</span>
            </p>
            <div className={`border-l border-[#30363d] pl-4`}>
              <p>{p.description}</p>
              {p.details.map((d, j) => (
                <p key={j} className={c.muted}>
                  - {d}
                </p>
              ))}
              <p className={`mt-1 ${c.purple}`}>{p.technologies.map((t) => `[${t}]`).join(" ")}</p>
              <p className="mt-1 flex gap-4">
                <Link href={p.github}>source</Link>
                {p.demo && <Link href={p.demo}>live</Link>}
              </p>
            </div>
          </div>
        ))}
      </div>
    );

    const skillsCmd = (arg?: string) => {
      if (arg) {
        const skill = skills.find(
          (s) => s.name.toLowerCase() === arg.toLowerCase() || slug(s.name) === slug(arg)
        );
        if (!skill)
          return (
            <p className={c.red}>
              skills: no such skill: {arg}. Try one of: {skillNames.join(", ")}
            </p>
          );
        return (
          <div>
            <p className={c.muted}># repositories tagged {skill.name}</p>
            {skill.sites?.map((site) => (
              <div key={site.url} className="flex flex-wrap gap-x-3">
                <span className={`w-20 ${c.orange}`}>  site</span>
                <Link href={site.url}>{site.title}</Link>
                <span className={c.muted}># {site.description}</span>
              </div>
            ))}
            {skill.repos.map((r) => (
              <RepoRow key={r} name={r} />
            ))}
          </div>
        );
      }
      return (
        <div>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            {skills.map((s) => (
              <button
                key={s.name}
                onClick={() => run(`skills ${s.name}`)}
                className={`${c.green} hover:bg-[#7ee787]/10`}
              >
                {s.name}
                <span className={c.muted}>({s.repos.length + (s.sites?.length ?? 0)})</span>
              </button>
            ))}
          </div>
          <p className={`mt-2 ${c.muted}`}>
            Click a skill or run <span className={c.fg}>skills &lt;name&gt;</span> to list its repos.
          </p>
        </div>
      );
    };

    const toolsCmd = () => (
      <div className="grid gap-y-1 sm:grid-cols-[16rem_1fr]">
        {tools.map((t) => (
          <React.Fragment key={t.name}>
            <span className={c.orange}>{t.name}</span>
            <span>{t.skills.join("  ")}</span>
          </React.Fragment>
        ))}
      </div>
    );

    const educationCmd = () => (
      <pre className="whitespace-pre-wrap font-mono">
        <Json value={education} />
      </pre>
    );

    const certsCmd = () => (
      <div className="space-y-0.5">
        {certifications.map((cert, i) => (
          <p key={i} className="flex flex-wrap gap-x-3">
            <span className={`${c.muted} w-20`}>{cert.date}</span>
            <Link href={cert.link} className={c.fg}>
              {cert.name}
            </Link>
            <span className={c.purple}>{cert.issuer}</span>
          </p>
        ))}
      </div>
    );

    const contact = () => (
      <div className="grid grid-cols-[6rem_1fr] gap-y-0.5">
        <span className={c.orange}>email</span>
        <Link href={`mailto:${profile.socials.email}`}>{profile.socials.email}</Link>
        <span className={c.orange}>github</span>
        <Link href={profile.socials.github}>{profile.socials.github}</Link>
        <span className={c.orange}>linkedin</span>
        <Link href={profile.socials.linkedin}>{profile.socials.linkedin}</Link>
      </div>
    );

    const resumeCmd = () => {
      if (typeof window !== "undefined") {
        const a = document.createElement("a");
        a.href = profile.resumeUrl;
        a.download = profile.resumeUrl.split("/").pop() ?? "resume.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      return (
        <p>
          Downloading <Link href={profile.resumeUrl}>{profile.resumeUrl.split("/").pop()}</Link> …{" "}
          <span className={c.green}>done</span>
        </p>
      );
    };

    const table: Record<string, (arg?: string) => React.ReactNode> = {
      help,
      whoami,
      about: aboutCmd,
      "cat about.md": aboutCmd,
      experience: experienceCmd,
      projects: projectsCmd,
      skills: skillsCmd,
      tools: toolsCmd,
      education: educationCmd,
      "cat education.json": educationCmd,
      certs: certsCmd,
      contact,
      resume: resumeCmd,
    };
    return { table, skillNames };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const execute = (raw: string): React.ReactNode => {
    const line = raw.trim();
    if (!line) return null;
    if (commands.table[line]) return commands.table[line]();
    const [name, ...rest] = line.split(/\s+/);
    const fn = commands.table[name.toLowerCase()];
    if (fn) return fn(rest.join(" ") || undefined);
    if (name === "sudo") return <p className={c.red}>Permission denied: nice try 🙂</p>;
    if (name === "history")
      return (
        <div>
          {past.map((p, i) => (
            <p key={i}>
              <span className={c.muted}>{String(i + 1).padStart(4)}</span> {p}
            </p>
          ))}
        </div>
      );
    return (
      <p>
        <span className={c.red}>command not found:</span> {name}. Type{" "}
        <span className={c.green}>help</span> for a list of commands.
      </p>
    );
  };

  const boot = useMemo<Entry[]>(
    () =>
      ["whoami", "cat about.md", "experience", "projects", "skills", "cat education.json", "certs", "contact"].map(
        (cmd, i) => ({ id: -i - 1, cmd, output: commands.table[cmd]() })
      ),
    [commands]
  );

  const [history, setHistory] = useState<Entry[]>(boot);

  function run(cmd: string) {
    const line = cmd.trim();
    if (line === "clear") {
      setHistory([]);
    } else {
      const output = execute(line);
      setHistory((h) => [...h, { id: idRef.current++, cmd: line, output }]);
    }
    if (line) setPast((p) => [...p, line]);
    setCursor(null);
    setInput("");
  }

  // Scroll to newest output after interactive commands (not on first paint)
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [history]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!past.length) return;
      const next = cursor === null ? past.length - 1 : Math.max(0, cursor - 1);
      setCursor(next);
      setInput(past[next]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (cursor === null) return;
      const next = cursor + 1;
      if (next >= past.length) {
        setCursor(null);
        setInput("");
      } else {
        setCursor(next);
        setInput(past[next]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const [name, ...rest] = input.split(" ");
      const pool =
        rest.length > 0 && name === "skills"
          ? commands.skillNames.map((s) => `skills ${s}`)
          : [...Object.keys(commands.table).filter((k) => !k.includes(" ")), "clear", "history"];
      const match = pool.find((p) => p.toLowerCase().startsWith(input.toLowerCase()));
      if (match) setInput(match);
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setHistory([]);
    }
  };

  const Prompt = () => (
    <span className="flex-shrink-0">
      <span className={c.green}>
        {handle}@{host}
      </span>
      <span className={c.muted}>:</span>
      <span className={c.blue}>~</span>
      <span className={c.muted}>$ </span>
    </span>
  );

  const quick = ["help", "about", "experience", "projects", "skills", "contact", "resume", "clear"];

  return (
    <div className="min-h-screen bg-[#010409] px-0 py-0 font-mono text-[13px] leading-relaxed text-[#c9d1d9] sm:px-6 sm:py-10 sm:text-sm">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col overflow-hidden border-[#30363d] bg-[#0d1117] shadow-2xl shadow-black/50 sm:min-h-[calc(100vh-5rem)] sm:rounded-xl sm:border">
        {/* Title bar */}
        <div className="sticky top-0 z-10 border-b border-[#30363d] bg-[#161b22]">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex gap-2">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            </div>
            <p className={`flex-1 truncate text-center text-xs ${c.muted}`}>
              {handle}@{host}: ~ — zsh
            </p>
            <a
              href={profile.resumeUrl}
              download
              className={`hidden text-xs sm:inline ${c.muted} hover:text-[#c9d1d9]`}
            >
              ⤓ resume.pdf
            </a>
          </div>
          <div className="flex gap-1 overflow-x-auto px-3 pb-2">
            {quick.map((q) => (
              <button
                key={q}
                onClick={() => {
                  run(q);
                  inputRef.current?.focus({ preventScroll: true });
                }}
                className="flex-shrink-0 rounded border border-[#30363d] px-2 py-0.5 text-xs text-[#8b949e] transition-colors hover:border-[#7ee787]/50 hover:text-[#7ee787]"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Screen */}
        <div
          className="flex-1 space-y-5 p-4 sm:p-6"
          onClick={() => {
            if (!window.getSelection()?.toString()) inputRef.current?.focus({ preventScroll: true });
          }}
        >
          <p className={c.muted}>
            Last login: {loginDate ?? "…"} on ttys001 — type{" "}
            <span className={c.green}>help</span> to see what this terminal can do.
          </p>
          {history.map((entry) => (
            <div key={entry.id}>
              <p className="flex flex-wrap">
                <Prompt />
                <span className={c.fg}>{entry.cmd}</span>
              </p>
              {entry.output && <div className="mt-1.5">{entry.output}</div>}
            </div>
          ))}

          <div className="flex items-center" ref={endRef}>
            <Prompt />
            <div className="relative flex-1">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                aria-label="Terminal input"
                className="w-full bg-transparent text-[#c9d1d9] caret-transparent outline-none"
              />
              <span
                className="pointer-events-none absolute top-0 h-full w-[0.6em] animate-pulse bg-[#c9d1d9]/70"
                style={{ left: `${input.length}ch` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

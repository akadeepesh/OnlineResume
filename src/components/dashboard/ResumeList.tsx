"use client";

import {
  ChevronDown,
  ClipboardPaste,
  Copy,
  ExternalLink,
  FileJson,
  FileText,
  Loader2,
  MoreHorizontal,
  Pencil,
  PencilLine,
  Plus,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  createResume,
  deleteResume,
  duplicateResume,
  importFromText,
  importResume,
  renameResume,
  setPrimaryResume,
  type ActionResult,
} from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AI_TEXT_MAX, AI_TEXT_MIN } from "@/lib/ai/extracted";
import { readResumeJson } from "@/lib/formats/files";
import { RESUME_TITLE_MAX } from "@/lib/resumes/slug";

export interface ResumeCard {
  id: string;
  title: string;
  slug: string;
  templateName: string;
  isPrimary: boolean;
  isPublished: boolean;
  /** Already formatted on the server, e.g. "5 min ago". */
  edited: string;
}

interface ResumeListProps {
  resumes: ResumeCard[];
  quota: { used: number; limit: number };
  /** "resume.example.com/jane" */
  baseLink: string;
  username: string;
  /** AI import from pasted text is configured on this deployment. */
  aiEnabled: boolean;
}

type DialogState =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "rename"; resume: ResumeCard }
  | { kind: "delete"; resume: ResumeCard }
  | { kind: "paste" };

const UNEXPECTED = "Something went wrong. Please try again.";

/** Runs a server action, turning thrown errors into a message. */
async function run(action: () => Promise<ActionResult>): Promise<ActionResult> {
  try {
    return await action();
  } catch {
    return { ok: false, error: UNEXPECTED };
  }
}

export default function ResumeList({ resumes, quota, baseLink, username, aiEnabled }: ResumeListProps) {
  const router = useRouter();
  const [dialog, setDialog] = useState<DialogState>({ kind: "closed" });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const full = quota.used >= quota.limit;
  const fileInput = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  /** A JSON file (ours or JSON Resume) becomes a new resume, opened in the editor. */
  async function onImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    const read = readResumeJson(await file.text());
    if (!read.ok) return setError(read.error);
    setImporting(true);
    const title = file.name.replace(/\.json$/i, "").slice(0, RESUME_TITLE_MAX);
    const result = await run(() => importResume(read.resume, "classic", read.resume.profile.name.trim() || title));
    setImporting(false);
    if (!result.ok) setError(result.error);
    else if (result.id) router.push(`/editor/${result.id}`);
  }

  async function quickAction(id: string, action: () => Promise<ActionResult>) {
    setError("");
    setBusyId(id);
    const result = await run(action);
    setBusyId(null);
    if (!result.ok) setError(result.error);
  }

  const close = () => setDialog({ kind: "closed" });

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Your resumes</h2>
          <p className="text-sm text-neutral-500">
            {quota.used} of {quota.limit} used
          </p>
        </div>
        <div className="flex gap-2">
          <input ref={fileInput} type="file" accept="application/json,.json" className="hidden" onChange={onImportFile} />
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={full || importing}>
                {importing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden />
                ) : (
                  <Upload className="mr-2 h-4 w-4" aria-hidden />
                )}
                Import
                <ChevronDown className="ml-1 h-3.5 w-3.5 text-neutral-500" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuItem onSelect={() => fileInput.current?.click()} className="gap-2">
                <FileJson className="h-4 w-4 text-neutral-500" aria-hidden />
                <span>
                  <span className="block text-sm">JSON file</span>
                  <span className="block text-xs text-neutral-500">OnlineResume or JSON Resume</span>
                </span>
              </DropdownMenuItem>
              {aiEnabled && (
                <DropdownMenuItem onSelect={() => setDialog({ kind: "paste" })} className="gap-2">
                  <ClipboardPaste className="h-4 w-4 text-neutral-500" aria-hidden />
                  <span>
                    <span className="block text-sm">Paste resume text</span>
                    <span className="block text-xs text-neutral-500">AI sorts it into sections</span>
                  </span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={() => setDialog({ kind: "create" })}
            disabled={full}
            title={full ? `You can keep up to ${quota.limit} resumes.` : undefined}
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden />
            New resume
          </Button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}
        </p>
      )}

      {resumes.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-neutral-300 px-6 py-12 text-center">
          <FileText className="mx-auto h-8 w-8 text-neutral-400" aria-hidden />
          <p className="mt-3 font-medium text-neutral-900">No resumes yet</p>
          <p className="mt-1 text-sm text-neutral-500">Create one to get your link.</p>
          <Button className="mt-4" onClick={() => setDialog({ kind: "create" })}>
            Create your first resume
          </Button>
        </div>
      ) : (
        <ul className="mt-6 grid gap-3">
          {resumes.map((resume) => (
            <li
              key={resume.id}
              className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4"
              aria-busy={busyId === resume.id}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/editor/${resume.id}`}
                    className="truncate font-medium text-neutral-900 underline-offset-4 hover:underline"
                  >
                    {resume.title}
                  </Link>
                  {resume.isPrimary && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      Primary
                    </span>
                  )}
                  {resume.isPublished ? (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      Published
                    </span>
                  ) : (
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                      Private
                    </span>
                  )}
                </div>
                <p className="mt-1 truncate text-sm text-neutral-500">
                  {resume.isPrimary ? baseLink : `${baseLink}/${resume.slug}`}
                </p>
                <p className="mt-0.5 text-xs text-neutral-400">
                  {resume.templateName} · Edited {resume.edited}
                </p>
              </div>

              {busyId === resume.id ? (
                <Loader2 className="h-4 w-4 animate-spin text-neutral-400 motion-reduce:animate-none" aria-label="Working" />
              ) : (
                // Non-modal: a modal menu that opens a dialog can leave the page unclickable (Radix).
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label={`Actions for ${resume.title}`} disabled={busyId !== null}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => router.push(`/editor/${resume.id}`)}>
                      <PencilLine className="mr-2 h-4 w-4" aria-hidden /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() =>
                        window.open(resume.isPrimary ? `/${username}` : `/${username}/${resume.slug}`, "_blank", "noopener")
                      }
                    >
                      <ExternalLink className="mr-2 h-4 w-4" aria-hidden /> {resume.isPublished ? "View page" : "Preview page"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setDialog({ kind: "rename", resume })}>
                      <Pencil className="mr-2 h-4 w-4" aria-hidden /> Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={full}
                      onSelect={() => quickAction(resume.id, () => duplicateResume(resume.id))}
                    >
                      <Copy className="mr-2 h-4 w-4" aria-hidden /> Duplicate
                    </DropdownMenuItem>
                    {!resume.isPrimary && (
                      <DropdownMenuItem onSelect={() => quickAction(resume.id, () => setPrimaryResume(resume.id))}>
                        <Star className="mr-2 h-4 w-4" aria-hidden /> Make primary
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-700"
                      onSelect={() => setDialog({ kind: "delete", resume })}
                    >
                      <Trash2 className="mr-2 h-4 w-4" aria-hidden /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </li>
          ))}
        </ul>
      )}

      {dialog.kind === "create" && (
        <TitleDialog
          heading="New resume"
          description="You can change the title any time. Only you see it."
          submitLabel="Create"
          initialTitle=""
          onClose={close}
          onSubmit={async (title) => {
            const result = await run(() => createResume(title));
            if (result.ok && result.id) router.push(`/editor/${result.id}`);
            return result;
          }}
        />
      )}
      {dialog.kind === "rename" && (
        <TitleDialog
          heading="Rename resume"
          description="Only the title changes. The link stays the same."
          submitLabel="Save"
          initialTitle={dialog.resume.title}
          onClose={close}
          onSubmit={(title) => run(() => renameResume(dialog.resume.id, title))}
        />
      )}
      {dialog.kind === "paste" && (
        <PasteDialog
          onClose={close}
          onSubmit={async (text) => {
            const result = await run(() => importFromText(text));
            if (result.ok && result.id) router.push(`/editor/${result.id}`);
            return result;
          }}
        />
      )}
      {dialog.kind === "delete" && (
        <DeleteDialog
          resume={dialog.resume}
          onClose={close}
          onConfirm={() => run(() => deleteResume(dialog.resume.id))}
        />
      )}
    </section>
  );
}

function TitleDialog({
  heading,
  description,
  submitLabel,
  initialTitle,
  onClose,
  onSubmit,
}: {
  heading: string;
  description: string;
  submitLabel: string;
  initialTitle: string;
  onClose: () => void;
  onSubmit: (title: string) => Promise<ActionResult>;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const result = await onSubmit(title);
    setPending(false);
    if (result.ok) onClose();
    else setError(result.error);
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !pending && onClose()}>
      <DialogContent className="max-w-md">
        <form onSubmit={submit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>{heading}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-1.5">
            <Label htmlFor="resume-title">Title</Label>
            <Input
              id="resume-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Software engineer"
              maxLength={RESUME_TITLE_MAX}
              required
              autoFocus
              disabled={pending}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "resume-title-error" : undefined}
            />
            {error && (
              <p id="resume-title-error" role="alert" className="text-xs text-amber-700">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending || title.trim() === ""}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden />}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({
  resume,
  onClose,
  onConfirm,
}: {
  resume: ResumeCard;
  onClose: () => void;
  onConfirm: () => Promise<ActionResult>;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function confirm() {
    setPending(true);
    setError("");
    const result = await onConfirm();
    setPending(false);
    if (result.ok) onClose();
    else setError(result.error);
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !pending && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete “{resume.title}”?</DialogTitle>
          <DialogDescription>
            This can&apos;t be undone.
            {resume.isPublished && " Its public link will stop working."}
            {resume.isPrimary && " Your most recently edited resume becomes the primary one."}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p role="alert" className="text-sm text-amber-700">
            {error}
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={confirm} disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PasteDialog({ onClose, onSubmit }: { onClose: () => void; onSubmit: (text: string) => Promise<ActionResult> }) {
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const length = text.trim().length;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const result = await onSubmit(text);
    setPending(false);
    if (result.ok) onClose();
    else setError(result.error);
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !pending && onClose()}>
      <DialogContent className="max-w-xl">
        <form onSubmit={submit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Paste your resume</DialogTitle>
            <DialogDescription>
              Copy the text from your current resume (PDF, Word, LinkedIn) and paste it here. AI sorts it into
              sections for you to check in the editor. The text is sent to our AI provider only for this.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-1.5">
            <Label htmlFor="resume-text" className="sr-only">
              Resume text
            </Label>
            <Textarea
              id="resume-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={12}
              maxLength={AI_TEXT_MAX}
              placeholder="Jane Doe&#10;Product Designer · Berlin&#10;&#10;Experience&#10;…"
              disabled={pending}
              autoFocus
              aria-describedby="resume-text-hint"
            />
            <p id="resume-text-hint" className="text-right text-xs text-neutral-400">
              {length.toLocaleString("en")} / {AI_TEXT_MAX.toLocaleString("en")}
            </p>
          </div>
          {error && (
            <p role="alert" className="text-sm text-amber-700">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending || length < AI_TEXT_MIN}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden />}
              {pending ? "Reading your resume…" : "Import"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

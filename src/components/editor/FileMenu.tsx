"use client";

import { ChevronDown, Download, FileJson, Upload } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadText } from "@/lib/formats/download";
import { exportFileName, readResumeJson, toJsonResumeText, toResumeJson } from "@/lib/formats/files";
import type { Resume } from "@/lib/resume/schema";
import { useEditorStoreApi } from "@/lib/store/editor";
import { cn } from "@/lib/utils";

/** Import a JSON file into the editor, or export the resume as JSON / JSON Resume. */
export default function FileMenu() {
  const store = useEditorStoreApi();
  const input = useRef<HTMLInputElement>(null);
  const [incoming, setIncoming] = useState<Resume | null>(null);
  const [error, setError] = useState("");

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // picking the same file again should work
    if (!file) return;
    const result = readResumeJson(await file.text());
    if (result.ok) setIncoming(result.resume);
    else setError(result.error);
  }

  const resume = () => store.getState().resume;

  return (
    <>
      <input ref={input} type="file" accept="application/json,.json" className="hidden" onChange={onFile} />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1")}>
          <FileJson className="h-4 w-4 sm:hidden" aria-hidden />
          <span className="hidden sm:inline">File</span>
          <ChevronDown className="h-3.5 w-3.5 text-neutral-500" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuItem onSelect={() => input.current?.click()} className="gap-2">
            <Upload className="h-4 w-4 text-neutral-500" aria-hidden />
            Import JSON…
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs font-normal text-neutral-500">Export</DropdownMenuLabel>
          <DropdownMenuItem
            className="gap-2"
            onSelect={() => downloadText(exportFileName(resume(), "resume"), toResumeJson(resume()))}
          >
            <Download className="h-4 w-4 text-neutral-500" aria-hidden />
            OnlineResume JSON
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2"
            onSelect={() => downloadText(exportFileName(resume(), "jsonresume"), toJsonResumeText(resume()))}
          >
            <Download className="h-4 w-4 text-neutral-500" aria-hidden />
            JSON Resume
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={incoming !== null} onOpenChange={(open) => !open && setIncoming(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Replace your resume with this file?</DialogTitle>
            <DialogDescription>
              {incoming?.profile.name.trim() ? `"${incoming.profile.name.trim()}" will replace` : "The file replaces"}{" "}
              everything you&apos;ve written. Undo brings it back.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIncoming(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (incoming) store.getState().loadResume(incoming);
                setIncoming(null);
              }}
            >
              Replace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={error !== ""} onOpenChange={(open) => !open && setError("")}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Couldn&apos;t import that file</DialogTitle>
            <DialogDescription>{error}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setError("")}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

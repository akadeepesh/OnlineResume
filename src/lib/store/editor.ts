import { createStore, useStore } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { createContext, useContext, useEffect } from "react";
import { blankResume, parseResumeDraft } from "@/lib/resume/draft";
import { sampleResume } from "@/lib/resume/sample";
import type { Profile, Resume, SectionKey, Socials } from "@/lib/resume/schema";
import type { SectionId } from "@/lib/editor/sections";
import { isTemplateSlug, type TemplateSlug } from "@/templates/meta";
import { EDITOR_STORAGE_KEY } from "./keys";

// ============================================================================
// Editor store: the resume being edited, plus the template it's previewed in.
//
// Guest mode keeps the draft in localStorage. Everything read back from
// storage is untrusted (an old version, a hand-edited value, another tab), so
// it is validated with `parseResumeDraft` before it replaces the defaults. A
// draft that fails validation is copied to a backup key instead of being
// silently deleted.
//
// Actions never mutate: each one returns new objects, so React selectors and
// undo/redo can compare by reference, and history snapshots share every part
// of the resume that didn't change (a photo is stored once, not per step).
//
// Undo/redo covers the resume only. The template is a way of looking at it,
// and history lives in memory: it isn't saved and starts empty on each load.
// ============================================================================

export { EDITOR_STORAGE_KEY };
export const EDITOR_BACKUP_KEY = `${EDITOR_STORAGE_KEY}:invalid`;
/**
 * Version of what's saved in localStorage. v2: the resume gained a section
 * order and hidden sections (resume schema v2). The resume itself is migrated
 * by `parseResumeDraft` in `merge`; `migrate` below only has to accept the
 * older envelope, because without a `migrate` function zustand throws an old
 * draft away and the next edit overwrites it.
 */
const STORE_VERSION = 2;
const DEFAULT_TEMPLATE: TemplateSlug = "classic";

/** Steps kept for undo. Snapshots share unchanged objects, so this is cheap. */
export const HISTORY_LIMIT = 100;
/** Edits to the same field closer together than this are one undo step... */
const GROUP_GAP_MS = 1000;
/** ...unless the burst has gone on longer than this (a long paragraph). */
const GROUP_MAX_MS = 5000;

/** Resume sections that are lists of items. */
export type ListSection =
  | "experience"
  | "projects"
  | "skills"
  | "tools"
  | "education"
  | "certifications";

export type ItemOf<S extends ListSection> = Resume[S][number];

/** What a freshly added item looks like, before the user types anything. */
export const emptyItem: { [S in ListSection]: () => ItemOf<S> } = {
  experience: () => ({ title: "", responsibilities: [], skills: [] }),
  projects: () => ({ name: "", details: [], technologies: [] }),
  skills: () => ({ name: "", icon: "code" }),
  tools: () => ({ name: "", skills: [] }),
  education: () => ({ institution: "" }),
  certifications: () => ({ name: "", icon: "file" }),
};

export interface EditorData {
  resume: Resume;
  template: TemplateSlug;
}

/** One undo (or redo) step: the resume to go back to, and where the change was. */
export interface HistoryEntry {
  resume: Resume;
  /** The editor section the change happened in; null for section layout changes. */
  section: SectionId | null;
}

export interface EditorState extends EditorData {
  /** False until the saved draft has been read from storage. */
  hasHydrated: boolean;
  /**
   * False when the browser refused to read or save the draft (site data
   * blocked, private mode, storage full). Editing still works in memory, but
   * the UI must not claim the work is saved.
   */
  storageAvailable: boolean;
  /** A change is waiting to be written (saving is debounced while typing). */
  savePending: boolean;
  /** When the draft was last written, or null if not during this visit. */
  lastSavedAt: number | null;

  /** Undo steps, oldest first. */
  past: HistoryEntry[];
  /** Redo steps, the next one last. */
  future: HistoryEntry[];
  /**
   * Bumped whenever the resume is swapped from outside the forms (undo, redo,
   * load, start over). List editors use it to re-match their item ids.
   */
  revision: number;
  /**
   * Step back. Returns the section the change was in (null for section
   * layout changes), or undefined when there was nothing to undo.
   */
  undo: () => SectionId | null | undefined;
  redo: () => SectionId | null | undefined;

  updateProfile: (patch: Partial<Omit<Profile, "socials">>) => void;
  updateSocials: (patch: Partial<Socials>) => void;
  setAbout: (about: string) => void;

  addItem: <S extends ListSection>(section: S, item?: Partial<ItemOf<S>>) => void;
  updateItem: <S extends ListSection>(section: S, index: number, patch: Partial<ItemOf<S>>) => void;
  removeItem: (section: ListSection, index: number) => void;
  /** Insert a copy right after the original. */
  duplicateItem: (section: ListSection, index: number) => void;
  moveItem: (section: ListSection, from: number, to: number) => void;

  setSectionHidden: (key: SectionKey, hidden: boolean) => void;
  /** Move a section within `resume.sectionOrder` (indexes into it). */
  moveSection: (from: number, to: number) => void;

  setTemplate: (template: TemplateSlug) => void;
  /** Replace the whole draft, e.g. after an import. */
  loadResume: (resume: Resume) => void;
  resetToExample: () => void;
  startBlank: () => void;
}

const exampleResume = (): Resume => structuredClone(sampleResume);

const inRange = (list: readonly unknown[], index: number) =>
  Number.isInteger(index) && index >= 0 && index < list.length;

/** The list with one entry moved (target clamped), or the same list if nothing moves. */
function moved<T>(list: T[], from: number, to: number): T[] {
  if (!inRange(list, from) || !Number.isInteger(to)) return list;
  const target = Math.min(Math.max(to, 0), list.length - 1);
  if (target === from) return list;
  const next = [...list];
  const [entry] = next.splice(from, 1);
  next.splice(target, 0, entry);
  return next;
}

/** No-op storage for the server, where localStorage doesn't exist. */
const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

/**
 * localStorage, looked up on every call: even reading `window.localStorage`
 * can throw when site data is blocked, and that must not break the module.
 */
const browserStorage = (): StateStorage =>
  typeof window === "undefined"
    ? noopStorage
    : {
        getItem: (key) => window.localStorage.getItem(key),
        setItem: (key, value) => window.localStorage.setItem(key, value),
        removeItem: (key) => window.localStorage.removeItem(key),
      };

export interface CreateEditorStoreOptions {
  /** Where the draft is kept. Defaults to localStorage in the browser. */
  storage?: StateStorage;
  /** Wait for an explicit `persist.rehydrate()` (avoids SSR hydration mismatches). */
  skipHydration?: boolean;
  /** Clock for grouping undo steps and save times. Tests pass their own. */
  now?: () => number;
  /**
   * Wait this long after the last change before writing. Typing then costs
   * one write per pause instead of one per key (a photo makes the draft big).
   * 0 writes on every change.
   */
  saveDelayMs?: number;
}

type SaveStatus = Pick<EditorState, "storageAvailable" | "savePending" | "lastSavedAt">;

export function createEditorStore({
  storage = browserStorage(),
  skipHydration = false,
  now = Date.now,
  saveDelayMs = 0,
}: CreateEditorStoreOptions = {}) {
  // Storage can throw at any time: blocked site data, private modes, or a
  // full quota (photos are stored as data URLs). An unhandled throw inside
  // zustand's hydration is swallowed and leaves `hasHydrated` false forever,
  // so every call is caught here and reported through `storageAvailable`.
  //
  // Status changes can happen before the store exists (the first read fails),
  // so they are collected until it does.
  let earlyStatus: Partial<SaveStatus> = {};
  let setStatus = (patch: Partial<SaveStatus>) => {
    earlyStatus = { ...earlyStatus, ...patch };
  };
  const attempt = <T>(fn: () => T, fallback: T): T => {
    try {
      return fn();
    } catch (error) {
      console.warn("Couldn't access browser storage for the resume draft.", error);
      setStatus({ storageAvailable: false });
      return fallback;
    }
  };

  // Saving. zustand calls setItem after every change, status updates
  // included, always with the whole draft as a string. `written` is the last
  // string handed to storage, so a change that lands back on it (undo then
  // redo, a status update) writes nothing and can't loop.
  let written: string | null = null;
  let queued: { key: string; value: string } | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const write = (key: string, value: string) => {
    written = value; // set first: the status update below re-enters setItem
    try {
      storage.setItem(key, value);
      setStatus({ storageAvailable: true, savePending: false, lastSavedAt: now() });
    } catch (error) {
      // Not retried until the draft changes again (removing a photo can fix a full quota).
      console.warn("Couldn't save the resume draft.", error);
      setStatus({ storageAvailable: false, savePending: false });
    }
  };

  /** Write a waiting change now, e.g. when the page is being left. */
  const flushSave = () => {
    clearTimeout(timer);
    timer = undefined;
    if (!queued) return;
    const { key, value } = queued;
    queued = null;
    write(key, value);
  };

  // zustand saves on every change, even before the saved draft has been read.
  // One early edit would then overwrite the draft before anyone saw it, so
  // writes are dropped until hydration has finished.
  let hydrated = false;
  const guardedStorage: StateStorage = {
    getItem: (key) => attempt(() => storage.getItem(key), null),
    setItem: (key, value) => {
      if (!hydrated) return;
      if (value === written) {
        // Back to what's already saved: drop the waiting write.
        if (queued) {
          queued = null;
          clearTimeout(timer);
          setStatus({ savePending: false });
        }
        return;
      }
      if (value === queued?.value) return;
      if (saveDelayMs <= 0) return write(key, value);
      queued = { key, value };
      setStatus({ savePending: true });
      clearTimeout(timer);
      timer = setTimeout(flushSave, saveDelayMs);
    },
    removeItem: (key) => attempt(() => storage.removeItem(key), undefined),
  };

  /** Keep a draft we can't use, so it can be recovered by hand. */
  const backUp = (persisted: unknown, reason: string, details?: unknown) => {
    try {
      storage.setItem(EDITOR_BACKUP_KEY, JSON.stringify(persisted));
    } catch {
      // Storage full or unavailable: nothing more we can do.
    }
    console.warn(reason, ...(details === undefined ? [] : [details]));
  };

  const store = createStore<EditorState>()(
    persist(
      (set, get) => {
        // The field currently being typed into, while its edits are grouped.
        let typing: { key: string; started: number; last: number } | null = null;

        /**
         * Apply a change to the resume and record it for undo. `group` names
         * the field being typed into: changes with the same name in quick
         * succession become one step. Structural changes pass no name, so
         * each is its own step. A change that changes nothing records nothing.
         */
        const updateResume = (
          fn: (resume: Resume) => Resume,
          where: { section: SectionId | null; group?: string; swap?: boolean },
        ) => {
          const { resume, past, revision } = get();
          const next = fn(resume);
          if (next === resume) return;
          const time = now();
          const continues =
            typing !== null &&
            typing.key === where.group &&
            time - typing.last < GROUP_GAP_MS &&
            time - typing.started < GROUP_MAX_MS;
          if (where.group === undefined) typing = null;
          else if (continues && typing) typing = { ...typing, last: time };
          else typing = { key: where.group, started: time, last: time };
          // One set call: list editors must never see the new resume with
          // the old revision, or they'd keep stale item ids.
          set({
            resume: next,
            future: [],
            past: continues ? past : [...past, { resume, section: where.section }].slice(-HISTORY_LIMIT),
            revision: where.swap ? revision + 1 : revision,
          });
        };

        /** Swap the whole resume (start over, import). Undoable. */
        const replaceResume = (next: Resume) => updateResume(() => next, { section: null, swap: true });

        const updateList = <S extends ListSection>(
          section: S,
          fn: (list: ItemOf<S>[]) => ItemOf<S>[],
          group?: string,
        ) =>
          updateResume(
            (resume) => {
              const list = resume[section] as ItemOf<S>[];
              const next = fn(list);
              return next === list ? resume : { ...resume, [section]: next };
            },
            { section, group },
          );

        /** Step through history: pop one stack, push the current resume onto the other. */
        const travel = (from: "past" | "future") => {
          const state = get();
          const stack = state[from];
          const entry = stack[stack.length - 1];
          if (!entry) return undefined;
          const to = from === "past" ? "future" : "past";
          typing = null;
          set({
            resume: entry.resume,
            [from]: stack.slice(0, -1),
            [to]: [...state[to], { resume: state.resume, section: entry.section }],
            revision: state.revision + 1,
          });
          return entry.section;
        };

        const fields = (patch: object) => Object.keys(patch).sort().join(",");

        return {
          resume: exampleResume(),
          template: DEFAULT_TEMPLATE,
          hasHydrated: false,
          storageAvailable: true,
          savePending: false,
          lastSavedAt: null,
          past: [],
          future: [],
          revision: 0,

          undo: () => travel("past"),
          redo: () => travel("future"),

          updateProfile: (patch) =>
            updateResume((r) => ({ ...r, profile: { ...r.profile, ...patch } }), {
              section: "profile",
              group: `profile:${fields(patch)}`,
            }),

          updateSocials: (patch) =>
            updateResume(
              (r) => ({
                ...r,
                profile: { ...r.profile, socials: { ...r.profile.socials, ...patch } },
              }),
              { section: "profile", group: `socials:${fields(patch)}` },
            ),

          setAbout: (about) =>
            updateResume((r) => (r.about === about ? r : { ...r, about }), {
              section: "about",
              group: "about",
            }),

          addItem: (section, item) =>
            updateList(section, (list) => [...list, { ...emptyItem[section](), ...item }]),

          updateItem: (section, index, patch) =>
            updateList(
              section,
              (list) =>
                inRange(list, index)
                  ? list.map((it, i) => (i === index ? { ...it, ...patch } : it))
                  : list,
              `item:${section}:${index}:${fields(patch)}`,
            ),

          removeItem: (section, index) =>
            updateList(section, (list) =>
              inRange(list, index) ? list.filter((_, i) => i !== index) : list,
            ),

          duplicateItem: (section, index) =>
            updateList(section, (list) =>
              inRange(list, index)
                ? [...list.slice(0, index + 1), structuredClone(list[index]), ...list.slice(index + 1)]
                : list,
            ),

          moveItem: (section, from, to) => updateList(section, (list) => moved(list, from, to)),

          setSectionHidden: (key, hidden) =>
            updateResume(
              (r) => {
                if (r.hiddenSections.includes(key) === hidden) return r;
                return {
                  ...r,
                  hiddenSections: hidden
                    ? [...r.hiddenSections, key]
                    : r.hiddenSections.filter((k) => k !== key),
                };
              },
              { section: null },
            ),

          moveSection: (from, to) =>
            updateResume(
              (r) => {
                const sectionOrder = moved(r.sectionOrder, from, to);
                return sectionOrder === r.sectionOrder ? r : { ...r, sectionOrder };
              },
              { section: null },
            ),

          setTemplate: (template) => set({ template }),
          loadResume: (resume) => replaceResume(structuredClone(resume)),
          resetToExample: () => replaceResume(exampleResume()),
          startBlank: () => replaceResume(blankResume()),
        };
      },
      {
        name: EDITOR_STORAGE_KEY,
        version: STORE_VERSION,
        storage: createJSONStorage(() => guardedStorage),
        skipHydration,
        partialize: (state): EditorData => ({ resume: state.resume, template: state.template }),
        migrate: (persisted, version) => {
          // Older drafts have the same shape; `merge` migrates the resume.
          if (version < STORE_VERSION) return persisted;
          // Written by a newer version of the app (e.g. a stale tab after a
          // rollback). Don't guess at its shape: keep it and start fresh.
          backUp(persisted, `Saved resume draft is from a newer version (${version}), starting fresh.`);
          return undefined;
        },
        // zustand calls merge on every hydration, even when nothing was saved,
        // so this is where hydration is marked as finished.
        merge: (persisted, currentState) => {
          hydrated = true;
          // History belongs to this page visit; it starts at the loaded draft.
          const current = { ...currentState, hasHydrated: true, past: [], future: [] };
          if (persisted == null) return current;
          const saved = persisted as Partial<EditorData>;
          const parsed = parseResumeDraft(saved.resume);
          if (!parsed.success) {
            backUp(persisted, "Saved resume draft is invalid, starting fresh.", parsed.issues);
            return current;
          }
          return {
            ...current,
            resume: parsed.data,
            template:
              typeof saved.template === "string" && isTemplateSlug(saved.template)
                ? saved.template
                : current.template,
          };
        },
      },
    ),
  );

  setStatus = (patch) => {
    // Only real changes: every setState triggers another setItem call.
    const state = store.getState();
    if ((Object.keys(patch) as (keyof SaveStatus)[]).some((key) => state[key] !== patch[key])) {
      store.setState(patch);
    }
  };
  setStatus(earlyStatus);

  if (typeof window !== "undefined" && saveDelayMs > 0) {
    // A waiting change must not be lost when the tab is closed or hidden
    // (phones often kill hidden tabs without a pagehide).
    window.addEventListener("pagehide", flushSave);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flushSave();
    });
  }

  return Object.assign(store, { flushSave });
}

export type EditorStore = ReturnType<typeof createEditorStore>;

/**
 * The guest editor's store, saved in localStorage. Hydration is manual so the
 * server render and the first client render match; call
 * `useEditorHydration()` once in the editor.
 */
export const editorStore = createEditorStore({ skipHydration: true, saveDelayMs: 600 });

/**
 * A store for a resume saved in the account. It starts from the server's copy
 * and keeps nothing in the browser: `useCloudSave` writes changes to the
 * database instead, so the localStorage status fields are unused.
 */
export function createCloudEditorStore(initial: EditorData): EditorStore {
  const envelope = JSON.stringify({ state: initial, version: STORE_VERSION });
  return createEditorStore({
    skipHydration: true,
    storage: { getItem: () => envelope, setItem: () => {}, removeItem: () => {} },
  });
}

/**
 * Which store the editor components use. Without a provider it's the guest
 * store; `/editor/[id]` provides a cloud store.
 */
const EditorStoreContext = createContext<EditorStore | null>(null);
export const EditorStoreProvider = EditorStoreContext.Provider;

export function useEditorStoreApi(): EditorStore {
  return useContext(EditorStoreContext) ?? editorStore;
}

export function useEditorStore<T>(selector: (state: EditorState) => T): T {
  return useStore(useEditorStoreApi(), selector);
}

/** Load the saved draft after mount. Returns true once it has been read. */
export function useEditorHydration(): boolean {
  const store = useEditorStoreApi();
  useEffect(() => {
    if (!store.persist.hasHydrated()) void store.persist.rehydrate();
  }, [store]);
  return useEditorStore((s) => s.hasHydrated);
}

import { createStore, useStore } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { useEffect } from "react";
import { blankResume, parseResumeDraft } from "@/lib/resume/draft";
import { sampleResume } from "@/lib/resume/sample";
import type { Profile, Resume, Socials } from "@/lib/resume/schema";
import { isTemplateSlug, type TemplateSlug } from "@/templates/meta";

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
// (later) undo/redo can compare by reference.
// ============================================================================

export const EDITOR_STORAGE_KEY = "onlineresume:editor-draft";
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
  skills: () => ({ name: "", icon: "code", repos: [] }),
  tools: () => ({ name: "", skills: [] }),
  education: () => ({ institution: "" }),
  certifications: () => ({ name: "", icon: "file" }),
};

export interface EditorData {
  resume: Resume;
  template: TemplateSlug;
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

  updateProfile: (patch: Partial<Omit<Profile, "socials">>) => void;
  updateSocials: (patch: Partial<Socials>) => void;
  setAbout: (about: string) => void;

  addItem: <S extends ListSection>(section: S, item?: Partial<ItemOf<S>>) => void;
  updateItem: <S extends ListSection>(section: S, index: number, patch: Partial<ItemOf<S>>) => void;
  removeItem: (section: ListSection, index: number) => void;
  /** Insert a copy right after the original. */
  duplicateItem: (section: ListSection, index: number) => void;
  moveItem: (section: ListSection, from: number, to: number) => void;

  setTemplate: (template: TemplateSlug) => void;
  /** Replace the whole draft, e.g. after an import. */
  loadResume: (resume: Resume) => void;
  resetToExample: () => void;
  startBlank: () => void;
}

const exampleResume = (): Resume => structuredClone(sampleResume);

const inRange = (list: readonly unknown[], index: number) =>
  Number.isInteger(index) && index >= 0 && index < list.length;

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
}

export function createEditorStore({
  storage = browserStorage(),
  skipHydration = false,
}: CreateEditorStoreOptions = {}) {
  // Storage can throw at any time: blocked site data, private modes, or a
  // full quota (photos are stored as data URLs). An unhandled throw inside
  // zustand's hydration is swallowed and leaves `hasHydrated` false forever,
  // so every call is caught here and reported through `storageAvailable`.
  let failedBeforeStoreExisted = false;
  let reportFailure = () => {
    failedBeforeStoreExisted = true;
  };
  const attempt = <T>(fn: () => T, fallback: T): T => {
    try {
      return fn();
    } catch (error) {
      console.warn("Couldn't access browser storage for the resume draft.", error);
      reportFailure();
      return fallback;
    }
  };

  // zustand saves on every change, even before the saved draft has been read.
  // One early edit would then overwrite the draft before anyone saw it, so
  // writes are dropped until hydration has finished.
  let hydrated = false;
  const guardedStorage: StateStorage = {
    getItem: (key) => attempt(() => storage.getItem(key), null),
    setItem: (key, value) => {
      if (hydrated) attempt(() => storage.setItem(key, value), undefined);
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
      (set) => {
        const updateResume = (fn: (resume: Resume) => Resume) =>
          set((state) => ({ resume: fn(state.resume) }));

        const updateList = <S extends ListSection>(
          section: S,
          fn: (list: ItemOf<S>[]) => ItemOf<S>[],
        ) =>
          updateResume((resume) => ({
            ...resume,
            [section]: fn(resume[section] as ItemOf<S>[]),
          }));

        return {
          resume: exampleResume(),
          template: DEFAULT_TEMPLATE,
          hasHydrated: false,
          storageAvailable: true,

          updateProfile: (patch) =>
            updateResume((r) => ({ ...r, profile: { ...r.profile, ...patch } })),

          updateSocials: (patch) =>
            updateResume((r) => ({
              ...r,
              profile: { ...r.profile, socials: { ...r.profile.socials, ...patch } },
            })),

          setAbout: (about) => updateResume((r) => ({ ...r, about })),

          addItem: (section, item) =>
            updateList(section, (list) => [...list, { ...emptyItem[section](), ...item }]),

          updateItem: (section, index, patch) =>
            updateList(section, (list) =>
              inRange(list, index)
                ? list.map((it, i) => (i === index ? { ...it, ...patch } : it))
                : list,
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

          moveItem: (section, from, to) =>
            updateList(section, (list) => {
              if (!inRange(list, from) || !Number.isInteger(to)) return list;
              const target = Math.min(Math.max(to, 0), list.length - 1);
              if (target === from) return list;
              const next = [...list];
              const [moved] = next.splice(from, 1);
              next.splice(target, 0, moved);
              return next;
            }),

          setTemplate: (template) => set({ template }),
          loadResume: (resume) => set({ resume: structuredClone(resume) }),
          resetToExample: () => set({ resume: exampleResume() }),
          startBlank: () => set({ resume: blankResume() }),
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
          const current = { ...currentState, hasHydrated: true };
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

  reportFailure = () => {
    // Only flip once: the setState below triggers a save, which fails again.
    if (store.getState().storageAvailable) store.setState({ storageAvailable: false });
  };
  if (failedBeforeStoreExisted) reportFailure();
  return store;
}

export type EditorStore = ReturnType<typeof createEditorStore>;

/**
 * The app-wide editor store. Hydration is manual so the server render and the
 * first client render match; call `useEditorHydration()` once in the editor.
 */
export const editorStore = createEditorStore({ skipHydration: true });

export function useEditorStore<T>(selector: (state: EditorState) => T): T {
  return useStore(editorStore, selector);
}

/** Load the saved draft after mount. Returns true once it has been read. */
export function useEditorHydration(): boolean {
  useEffect(() => {
    if (!editorStore.persist.hasHydrated()) void editorStore.persist.rehydrate();
  }, []);
  return useEditorStore((s) => s.hasHydrated);
}

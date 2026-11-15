import { afterEach, describe, expect, it, vi } from "vitest";
import type { StateStorage } from "zustand/middleware";
import { blankResume } from "@/lib/resume/draft";
import { sampleResume } from "@/lib/resume/sample";
import { DEFAULT_SECTION_ORDER, RESUME_SCHEMA_VERSION } from "@/lib/resume/schema";
import {
  EDITOR_BACKUP_KEY,
  EDITOR_STORAGE_KEY,
  createEditorStore,
  emptyItem,
  type ListSection,
} from "./editor";

const memoryStorage = (initial: Record<string, string> = {}) => {
  const data = new Map(Object.entries(initial));
  const storage: StateStorage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
  return { storage, data };
};

const saved = (state: unknown, version = 2) => ({
  [EDITOR_STORAGE_KEY]: JSON.stringify({ state, version }),
});

const newStore = (initial?: Record<string, string>) => {
  const { storage, data } = memoryStorage(initial);
  return { store: createEditorStore({ storage, skipHydration: true }), data };
};

afterEach(() => vi.restoreAllMocks());

describe("editor store defaults", () => {
  it("starts from a copy of the example resume", () => {
    const { store } = newStore();
    const { resume, template } = store.getState();
    expect(resume).toEqual(sampleResume);
    expect(resume).not.toBe(sampleResume);
    expect(template).toBe("classic");
  });

  it("never mutates the shared sample", () => {
    const { store } = newStore();
    store.getState().updateProfile({ name: "Changed" });
    store.getState().addItem("skills");
    expect(sampleResume.profile.name).toBe("Alex Morgan");
    expect(store.getState().resume.skills.length).toBe(sampleResume.skills.length + 1);
  });
});

describe("profile and about", () => {
  it("patches profile fields and socials separately", () => {
    const { store } = newStore();
    store.getState().updateProfile({ name: "Sam", role: "Designer" });
    store.getState().updateSocials({ github: "https://github.com/sam" });
    const { profile } = store.getState().resume;
    expect(profile.name).toBe("Sam");
    expect(profile.role).toBe("Designer");
    expect(profile.tagline).toBe(sampleResume.profile.tagline);
    expect(profile.socials.github).toBe("https://github.com/sam");
    expect(profile.socials.email).toBe(sampleResume.profile.socials.email);
  });

  it("sets about", () => {
    const { store } = newStore();
    store.getState().setAbout("Hello");
    expect(store.getState().resume.about).toBe("Hello");
  });
});

describe("list actions", () => {
  const sections = Object.keys(emptyItem) as ListSection[];

  it.each(sections)("adds an empty %s item", (section) => {
    const { store } = newStore();
    store.getState().startBlank();
    store.getState().addItem(section);
    expect(store.getState().resume[section]).toEqual([emptyItem[section]()]);
  });

  it("adds an item with initial values", () => {
    const { store } = newStore();
    store.getState().startBlank();
    store.getState().addItem("education", { institution: "Lakeside College" });
    expect(store.getState().resume.education).toEqual([{ institution: "Lakeside College" }]);
  });

  it("updates one item and leaves the others untouched", () => {
    const { store } = newStore();
    const before = store.getState().resume.experience;
    store.getState().updateItem("experience", 0, { company: "New Co" });
    const after = store.getState().resume.experience;
    expect(after[0]).toEqual({ ...before[0], company: "New Co" });
    expect(after[1]).toBe(before[1]);
  });

  it("removes an item", () => {
    const { store } = newStore();
    const [, second] = store.getState().resume.projects;
    store.getState().removeItem("projects", 0);
    expect(store.getState().resume.projects[0]).toBe(second);
  });

  it("duplicates an item right after the original, as a deep copy", () => {
    const { store } = newStore();
    const count = store.getState().resume.experience.length;
    store.getState().duplicateItem("experience", 0);
    const list = store.getState().resume.experience;
    expect(list.length).toBe(count + 1);
    expect(list[1]).toEqual(list[0]);
    expect(list[1].responsibilities).not.toBe(list[0].responsibilities);
  });

  it("moves an item and clamps the target", () => {
    const { store } = newStore();
    store.getState().startBlank();
    for (const name of ["a", "b", "c"]) store.getState().addItem("tools", { name });
    const names = () => store.getState().resume.tools.map((t) => t.name);

    store.getState().moveItem("tools", 0, 2);
    expect(names()).toEqual(["b", "c", "a"]);
    store.getState().moveItem("tools", 2, -5);
    expect(names()).toEqual(["a", "b", "c"]);
    store.getState().moveItem("tools", 0, 99);
    expect(names()).toEqual(["b", "c", "a"]);
  });

  it("ignores out-of-range indexes without changing state", () => {
    const { store } = newStore();
    const before = store.getState().resume;
    store.getState().updateItem("skills", 99, { name: "x" });
    store.getState().removeItem("skills", -1);
    store.getState().duplicateItem("skills", 1.5);
    store.getState().moveItem("skills", 99, 0);
    expect(store.getState().resume.skills).toBe(before.skills);
  });
});

describe("whole-resume actions", () => {
  it("starts blank, resets to the example, and loads a resume", () => {
    const { store } = newStore();
    store.getState().startBlank();
    expect(store.getState().resume).toEqual(blankResume());

    store.getState().resetToExample();
    expect(store.getState().resume).toEqual(sampleResume);

    const imported = { ...blankResume(), profile: { name: "Imported", socials: {} } };
    store.getState().loadResume(imported);
    expect(store.getState().resume).toEqual(imported);
    expect(store.getState().resume).not.toBe(imported);
  });

  it("sets the template", () => {
    const { store } = newStore();
    store.getState().setTemplate("bento");
    expect(store.getState().template).toBe("bento");
  });
});

describe("persistence", () => {
  it("saves the resume and template, not flags or actions", async () => {
    const { store, data } = newStore();
    await store.persist.rehydrate();
    store.getState().updateProfile({ name: "Saved" });
    store.getState().setTemplate("terminal");
    const raw = JSON.parse(data.get(EDITOR_STORAGE_KEY)!);
    expect(Object.keys(raw.state).sort()).toEqual(["resume", "template"]);
    expect(raw.state.resume.profile.name).toBe("Saved");
    expect(raw.state.template).toBe("terminal");
  });

  it("restores a saved draft, including one with an empty name", async () => {
    const draft = { ...blankResume(), about: "Work in progress" };
    const { store } = newStore(saved({ resume: draft, template: "editorial" }));
    await store.persist.rehydrate();
    expect(store.getState().resume).toEqual(draft);
    expect(store.getState().template).toBe("editorial");
    expect(store.getState().hasHydrated).toBe(true);
  });

  it("fills in defaults the saved draft left out", async () => {
    const { store } = newStore(saved({ resume: { schemaVersion: RESUME_SCHEMA_VERSION, profile: { name: "Old" } } }));
    await store.persist.rehydrate();
    expect(store.getState().resume.profile.name).toBe("Old");
    expect(store.getState().resume.experience).toEqual([]);
    expect(store.getState().template).toBe("classic");
  });

  it("keeps the saved resume but drops an unknown template", async () => {
    const { store } = newStore(saved({ resume: blankResume(), template: "gone" }));
    await store.persist.rehydrate();
    expect(store.getState().resume).toEqual(blankResume());
    expect(store.getState().template).toBe("classic");
  });

  it("backs up an invalid draft instead of deleting it, and falls back to the example", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const bad = { resume: { schemaVersion: RESUME_SCHEMA_VERSION, profile: { name: 42 } }, template: "bento" };
    const { store, data } = newStore(saved(bad));
    await store.persist.rehydrate();

    expect(store.getState().resume).toEqual(sampleResume);
    expect(store.getState().hasHydrated).toBe(true);
    expect(JSON.parse(data.get(EDITOR_BACKUP_KEY)!)).toEqual(bad);
    expect(warn).toHaveBeenCalledOnce();
  });

  it("upgrades a draft saved by the previous version instead of dropping it", async () => {
    // What PR #45–#49 wrote: store version 1, resume schema version 1.
    const old = { resume: { schemaVersion: 1, profile: { name: "Kept" }, about: "Old" }, template: "bento" };
    const { store, data } = newStore(saved(old, 1));
    await store.persist.rehydrate();

    expect(store.getState().resume.profile.name).toBe("Kept");
    expect(store.getState().resume.about).toBe("Old");
    expect(store.getState().resume.sectionOrder).toEqual([...DEFAULT_SECTION_ORDER]);
    expect(store.getState().template).toBe("bento");
    // Written back in the new format straight away.
    const raw = JSON.parse(data.get(EDITOR_STORAGE_KEY)!);
    expect(raw.version).toBe(2);
    expect(raw.state.resume.schemaVersion).toBe(RESUME_SCHEMA_VERSION);
    expect(data.has(EDITOR_BACKUP_KEY)).toBe(false);
  });

  it("backs up a draft from an old version that can't be upgraded", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const old = { resume: { schemaVersion: 1, profile: { name: 42 } } };
    const { store, data } = newStore(saved(old, 1));
    await store.persist.rehydrate();
    expect(store.getState().resume).toEqual(sampleResume);
    expect(JSON.parse(data.get(EDITOR_BACKUP_KEY)!)).toEqual(old);
  });

  it("backs up a draft written by a newer version rather than guessing at it", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const future = { resume: { schemaVersion: 9, profile: { name: "From the future" } }, template: "classic" };
    const { store, data } = newStore(saved(future, 9));
    await store.persist.rehydrate();
    expect(store.getState().hasHydrated).toBe(true);
    expect(store.getState().resume).toEqual(sampleResume);
    expect(JSON.parse(data.get(EDITOR_BACKUP_KEY)!)).toEqual(future);
  });

  it("marks itself hydrated even when nothing was saved", async () => {
    const { store } = newStore();
    await store.persist.rehydrate();
    expect(store.getState().hasHydrated).toBe(true);
    expect(store.getState().storageAvailable).toBe(true);
    expect(store.getState().resume).toEqual(sampleResume);
  });

  it("hydrates immediately when created without skipHydration", () => {
    const { storage } = memoryStorage(saved({ resume: blankResume() }));
    const store = createEditorStore({ storage });
    expect(store.getState().hasHydrated).toBe(true);
    expect(store.getState().resume).toEqual(blankResume());
  });

  it("does not overwrite the saved draft before it has been read", async () => {
    const draft = { ...blankResume(), about: "Keep me" };
    const { store, data } = newStore(saved({ resume: draft }));
    store.getState().setTemplate("bento");
    expect(JSON.parse(data.get(EDITOR_STORAGE_KEY)!).state.resume).toEqual(draft);

    await store.persist.rehydrate();
    expect(store.getState().resume).toEqual(draft);
  });

  it("still finishes loading when storage throws (blocked site data, private modes)", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const blocked: StateStorage = {
      getItem: () => {
        throw new DOMException("The operation is insecure.", "SecurityError");
      },
      setItem: () => {
        throw new DOMException("The quota has been exceeded.", "QuotaExceededError");
      },
      removeItem: () => {},
    };
    const store = createEditorStore({ storage: blocked, skipHydration: true });
    await store.persist.rehydrate();
    expect(store.getState().hasHydrated).toBe(true);
    expect(store.getState().storageAvailable).toBe(false);
    expect(store.getState().resume).toEqual(sampleResume);
    // Editing still works in memory; failed saves don't throw into the UI.
    expect(() => store.getState().updateProfile({ name: "Still editing" })).not.toThrow();
    expect(store.getState().resume.profile.name).toBe("Still editing");
  });

  it("reports a full quota when saving fails after loading", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    let full = false;
    const { storage } = memoryStorage();
    const flaky: StateStorage = {
      ...storage,
      setItem: (key, value) => {
        if (full) throw new DOMException("Quota exceeded", "QuotaExceededError");
        storage.setItem(key, value);
      },
    };
    const store = createEditorStore({ storage: flaky, skipHydration: true });
    await store.persist.rehydrate();
    expect(store.getState().storageAvailable).toBe(true);
    full = true;
    store.getState().updateProfile({ avatar: "data:image/jpeg;base64,..." });
    expect(store.getState().storageAvailable).toBe(false);
    expect(store.getState().resume.profile.avatar).toBe("data:image/jpeg;base64,...");
  });

  it("works without any storage on the server", () => {
    const store = createEditorStore({ skipHydration: true });
    store.getState().updateProfile({ name: "Server" });
    expect(store.getState().resume.profile.name).toBe("Server");
  });
});

describe("section layout", () => {
  it("hides and shows a section", () => {
    const { store } = newStore();
    store.getState().setSectionHidden("tools", true);
    store.getState().setSectionHidden("tools", true);
    expect(store.getState().resume.hiddenSections).toEqual(["tools"]);
    store.getState().setSectionHidden("tools", false);
    expect(store.getState().resume.hiddenSections).toEqual([]);
  });

  it("moves a section and clamps the target", () => {
    const { store } = newStore();
    store.getState().moveSection(6, 0);
    expect(store.getState().resume.sectionOrder[0]).toBe("certifications");
    store.getState().moveSection(0, 99);
    expect(store.getState().resume.sectionOrder).toEqual([...DEFAULT_SECTION_ORDER]);
  });
});

describe("undo and redo", () => {
  /** A store with a clock the test controls. */
  const timed = () => {
    let time = 1_000_000;
    const { storage } = memoryStorage();
    const store = createEditorStore({ storage, skipHydration: true, now: () => time });
    return { store, tick: (ms: number) => (time += ms) };
  };

  it("undoes and redoes an edit", () => {
    const { store } = timed();
    store.getState().updateProfile({ role: "Designer" });
    expect(store.getState().undo()).toBe("profile");
    expect(store.getState().resume.profile.role).toBe(sampleResume.profile.role);
    expect(store.getState().redo()).toBe("profile");
    expect(store.getState().resume.profile.role).toBe("Designer");
  });

  it("does nothing when there is nothing to undo or redo", () => {
    const { store } = timed();
    const before = store.getState().resume;
    expect(store.getState().undo()).toBeUndefined();
    expect(store.getState().redo()).toBeUndefined();
    expect(store.getState().resume).toBe(before);
  });

  it("groups quick typing in one field into one step", () => {
    const { store, tick } = timed();
    for (const name of ["S", "Sa", "Sam"]) {
      store.getState().updateProfile({ name });
      tick(300);
    }
    store.getState().undo();
    expect(store.getState().resume.profile.name).toBe("Alex Morgan");
    expect(store.getState().past).toHaveLength(0);
  });

  it("starts a new step after a pause, in another field, or after 5 seconds of typing", () => {
    const { store, tick } = timed();
    store.getState().updateProfile({ name: "Sam" });
    tick(1500); // pause
    store.getState().updateProfile({ name: "Sam Lee" });
    store.getState().updateProfile({ role: "Chef" }); // another field
    expect(store.getState().past).toHaveLength(3);

    const long = timed();
    for (let i = 1; i <= 30; i++) {
      long.store.getState().setAbout("x".repeat(i));
      long.tick(400); // never pausing, 12 seconds in all
    }
    expect(long.store.getState().past.length).toBeGreaterThanOrEqual(3);
  });

  it("keeps every structural change as its own step, however quick", () => {
    const { store } = timed();
    store.getState().addItem("skills");
    store.getState().addItem("skills");
    store.getState().moveItem("skills", 0, 1);
    expect(store.getState().past).toHaveLength(3);
  });

  it("ignores changes that change nothing", () => {
    const { store } = timed();
    store.getState().removeItem("skills", 99);
    store.getState().moveItem("skills", 0, 0);
    store.getState().setSectionHidden("about", false);
    expect(store.getState().past).toHaveLength(0);
  });

  it("clears redo after a new edit", () => {
    const { store } = timed();
    store.getState().setAbout("One");
    store.getState().undo();
    store.getState().addItem("tools");
    expect(store.getState().future).toHaveLength(0);
    expect(store.getState().redo()).toBeUndefined();
  });

  it("can undo start over, start blank and loading a resume", () => {
    const { store } = timed();
    store.getState().updateProfile({ name: "Mine" });
    store.getState().startBlank();
    store.getState().undo();
    expect(store.getState().resume.profile.name).toBe("Mine");
    store.getState().resetToExample();
    store.getState().undo();
    expect(store.getState().resume.profile.name).toBe("Mine");
    store.getState().loadResume(blankResume());
    store.getState().undo();
    expect(store.getState().resume.profile.name).toBe("Mine");
  });

  it("undoes section moves and visibility without jumping to a section", () => {
    const { store } = timed();
    store.getState().moveSection(0, 3);
    store.getState().setSectionHidden("projects", true);
    expect(store.getState().undo()).toBeNull();
    expect(store.getState().resume.hiddenSections).toEqual([]);
    expect(store.getState().undo()).toBeNull();
    expect(store.getState().resume.sectionOrder).toEqual([...DEFAULT_SECTION_ORDER]);
  });

  it("reports which section a list change was in", () => {
    const { store } = timed();
    store.getState().updateItem("education", 0, { degree: "BA" });
    store.getState().removeItem("projects", 0);
    expect(store.getState().undo()).toBe("projects");
    expect(store.getState().undo()).toBe("education");
  });

  it("doesn't track the template: it's a view choice, not content", () => {
    const { store } = timed();
    store.getState().setTemplate("bento");
    expect(store.getState().past).toHaveLength(0);
  });

  it("keeps at most 100 steps", () => {
    const { store } = timed();
    for (let i = 0; i < 120; i++) store.getState().addItem("tools");
    expect(store.getState().past).toHaveLength(100);
  });

  it("bumps the revision only when the whole resume is swapped (undo, redo, load)", () => {
    const { store } = timed();
    const start = store.getState().revision;
    store.getState().setAbout("Typed");
    store.getState().addItem("skills");
    expect(store.getState().revision).toBe(start);
    store.getState().undo();
    store.getState().redo();
    store.getState().resetToExample();
    expect(store.getState().revision).toBe(start + 3);
  });

  it("is not saved, and starts empty after loading a draft", async () => {
    const { store, data } = newStore(saved({ resume: blankResume() }));
    store.getState().setAbout("Before load");
    await store.persist.rehydrate();
    expect(store.getState().past).toHaveLength(0);
    store.getState().setAbout("After load");
    expect(Object.keys(JSON.parse(data.get(EDITOR_STORAGE_KEY)!).state)).toEqual(["resume", "template"]);
  });
});

describe("autosave", () => {
  /** A store that waits `saveDelayMs` before writing, with a counting storage. */
  const delayed = (initial?: Record<string, string>) => {
    const { storage, data } = memoryStorage(initial);
    let writes = 0;
    let failing = false;
    const counting: StateStorage = {
      ...storage,
      setItem: (key, value) => {
        if (failing) throw new DOMException("Quota exceeded", "QuotaExceededError");
        if (key === EDITOR_STORAGE_KEY) writes++;
        storage.setItem(key, value);
      },
    };
    let time = 5_000;
    const store = createEditorStore({ storage: counting, skipHydration: true, saveDelayMs: 500, now: () => time });
    return {
      store,
      data,
      writes: () => writes,
      fail: (on: boolean) => (failing = on),
      setTime: (t: number) => (time = t),
    };
  };
  const savedName = (data: Map<string, string>) =>
    JSON.parse(data.get(EDITOR_STORAGE_KEY) ?? "null")?.state.resume.profile.name;

  afterEach(() => vi.useRealTimers());

  it("waits for a pause in typing, then writes once", async () => {
    vi.useFakeTimers();
    const { store, data, writes } = delayed();
    await store.persist.rehydrate();
    const before = writes();
    for (const name of ["S", "Sa", "Sam"]) {
      store.getState().updateProfile({ name });
      vi.advanceTimersByTime(200);
    }
    expect(store.getState().savePending).toBe(true);
    expect(savedName(data)).not.toBe("Sam");

    vi.advanceTimersByTime(500);
    expect(savedName(data)).toBe("Sam");
    expect(writes() - before).toBe(1);
    expect(store.getState().savePending).toBe(false);
  });

  it("records when it last saved, and only when something was written", async () => {
    vi.useFakeTimers();
    const { store, writes, setTime } = delayed();
    await store.persist.rehydrate();
    expect(store.getState().lastSavedAt).toBeNull();

    setTime(42_000);
    store.getState().setAbout("Hello");
    vi.advanceTimersByTime(500);
    expect(store.getState().lastSavedAt).toBe(42_000);

    // Undo then redo lands on the resume already written: nothing to write.
    const count = writes();
    store.getState().undo();
    store.getState().redo();
    vi.advanceTimersByTime(500);
    expect(writes()).toBe(count); // same resume as last written: nothing to do
  });

  it("writes straight away when the page is being left", async () => {
    vi.useFakeTimers();
    const { store, data } = delayed();
    await store.persist.rehydrate();
    store.getState().updateProfile({ name: "Leaving" });
    store.flushSave();
    expect(savedName(data)).toBe("Leaving");
    expect(store.getState().savePending).toBe(false);
  });

  it("reports a failed save, then recovers once a save works again", async () => {
    vi.useFakeTimers();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const { store, data, fail } = delayed();
    await store.persist.rehydrate();

    fail(true);
    store.getState().updateProfile({ avatar: "data:image/jpeg;base64,big" });
    vi.advanceTimersByTime(500);
    expect(store.getState().storageAvailable).toBe(false);
    expect(store.getState().savePending).toBe(false);

    fail(false);
    store.getState().updateProfile({ avatar: undefined });
    vi.advanceTimersByTime(500);
    expect(store.getState().storageAvailable).toBe(true);
    expect(savedName(data)).toBe("Alex Morgan");
  });
});

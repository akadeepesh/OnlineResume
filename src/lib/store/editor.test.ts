import { afterEach, describe, expect, it, vi } from "vitest";
import type { StateStorage } from "zustand/middleware";
import { blankResume } from "@/lib/resume/draft";
import { sampleResume } from "@/lib/resume/sample";
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

const saved = (state: unknown, version = 1) => ({
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
    const { store } = newStore(saved({ resume: { schemaVersion: 1, profile: { name: "Old" } } }));
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
    const bad = { resume: { schemaVersion: 1, profile: { name: 42 } }, template: "bento" };
    const { store, data } = newStore(saved(bad));
    await store.persist.rehydrate();

    expect(store.getState().resume).toEqual(sampleResume);
    expect(store.getState().hasHydrated).toBe(true);
    expect(JSON.parse(data.get(EDITOR_BACKUP_KEY)!)).toEqual(bad);
    expect(warn).toHaveBeenCalledOnce();
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

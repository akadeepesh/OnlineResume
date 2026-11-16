import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sampleResume } from "@/lib/resume/sample";
import { createCloudEditorStore } from "@/lib/store/editor";
import { createCloudSave } from "./cloud-save";

const saveResume = vi.hoisted(() => vi.fn());
vi.mock("@/app/editor/[id]/actions", () => ({ saveResume }));

async function setup() {
  const store = createCloudEditorStore({ resume: structuredClone(sampleResume), template: "classic" });
  await store.persist.rehydrate();
  const save = createCloudSave(store, "id-1", "2026-11-17T10:00:00.000Z");
  const stop = save.start();
  const state = () => save.status.getState().state;
  return { store, save, stop, state };
}

describe("cloud autosave", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    saveResume.mockReset();
  });
  afterEach(() => vi.useRealTimers());

  it("waits for a pause, then saves once with the loaded version", async () => {
    saveResume.mockResolvedValue({ ok: true, updatedAt: "2026-11-17T10:00:05.000Z" });
    const { store, state, stop } = await setup();

    store.getState().setAbout("a");
    store.getState().setAbout("ab");
    expect(state().kind).toBe("pending");
    expect(saveResume).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1000);
    expect(saveResume).toHaveBeenCalledTimes(1);
    expect(saveResume.mock.calls[0]![2]).toBe("2026-11-17T10:00:00.000Z");
    expect(saveResume.mock.calls[0]![1].resume.about).toBe("ab");
    expect(state().kind).toBe("saved");

    // The next save builds on the version the server returned.
    store.getState().setAbout("abc");
    await vi.advanceTimersByTimeAsync(1000);
    expect(saveResume.mock.calls[1]![2]).toBe("2026-11-17T10:00:05.000Z");
    stop();
  });

  it("sends changes made during a save right after it", async () => {
    let finish!: (value: unknown) => void;
    saveResume.mockImplementationOnce(() => new Promise((resolve) => (finish = resolve)));
    saveResume.mockResolvedValue({ ok: true, updatedAt: "2026-11-17T10:00:09.000Z" });
    const { store, stop } = await setup();

    store.getState().setAbout("first");
    await vi.advanceTimersByTimeAsync(1000);
    store.getState().setAbout("second");
    await vi.advanceTimersByTimeAsync(1000); // still in flight: no second request yet
    expect(saveResume).toHaveBeenCalledTimes(1);

    finish({ ok: true, updatedAt: "2026-11-17T10:00:05.000Z" });
    await vi.runAllTimersAsync();
    expect(saveResume).toHaveBeenCalledTimes(2);
    expect(saveResume.mock.calls[1]![1].resume.about).toBe("second");
    expect(saveResume.mock.calls[1]![2]).toBe("2026-11-17T10:00:05.000Z");
    stop();
  });

  it("stops on a conflict until the user keeps their copy", async () => {
    saveResume.mockResolvedValueOnce({ ok: false, reason: "conflict" });
    saveResume.mockResolvedValue({ ok: true, updatedAt: "2026-11-17T10:01:00.000Z" });
    const { store, save, state, stop } = await setup();

    store.getState().setAbout("mine");
    await vi.advanceTimersByTimeAsync(1000);
    expect(state().kind).toBe("conflict");

    store.getState().setAbout("mine, more");
    await vi.advanceTimersByTimeAsync(5000);
    expect(saveResume).toHaveBeenCalledTimes(1);

    save.keepMine();
    await vi.runAllTimersAsync();
    expect(saveResume).toHaveBeenCalledTimes(2);
    expect(saveResume.mock.calls[1]![2]).toBeNull();
    expect(state().kind).toBe("saved");
    stop();
  });

  it("retries after a network error", async () => {
    saveResume.mockRejectedValueOnce(new Error("offline"));
    saveResume.mockResolvedValue({ ok: true, updatedAt: "2026-11-17T10:02:00.000Z" });
    const { store, state, stop } = await setup();

    store.getState().setAbout("x");
    await vi.advanceTimersByTimeAsync(1000);
    expect(state().kind).toBe("error");
    await vi.advanceTimersByTimeAsync(5000);
    expect(saveResume).toHaveBeenCalledTimes(2);
    expect(state().kind).toBe("saved");
    stop();
  });
});

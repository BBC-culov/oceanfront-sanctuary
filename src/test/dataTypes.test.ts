import { describe, expect, it } from "vitest";
import { errorMessage, stringArray } from "@/lib/dataTypes";
import { extractEdgeError } from "@/lib/edgeError";

describe("data boundary compatibility", () => {
  it("preserves arrays and the existing non-array fallback", () => {
    const values = ["photo.jpg", "", "video.mp4"];
    expect(stringArray(values)).toBe(values);
    expect(stringArray(null)).toEqual([]);
    expect(stringArray({ url: "photo.jpg" })).toEqual([]);
  });
  it("keeps both SDK and plain-object error messages", () => {
    expect(errorMessage(new Error("SDK error"))).toBe("SDK error");
    expect(errorMessage({ message: "plain error" })).toBe("plain error");
    expect(errorMessage({ message: 123 })).toBeUndefined();
    expect(errorMessage(null)).toBeUndefined();
  });
  it("keeps the specific payment error rather than the generic SDK message", async () => {
    const error = { context: new Response(JSON.stringify({ error: "Date non più disponibili" })), message: "non-2xx" };
    expect(await extractEdgeError(error)).toBe("Date non più disponibili");
  });
  it("falls back to the SDK message if parsing fails", async () => {
    expect(await extractEdgeError({ context: new Response("invalid"), message: "SDK error" })).toBe("SDK error");
    expect(await extractEdgeError(null, "Fallback")).toBe("Fallback");
  });
});
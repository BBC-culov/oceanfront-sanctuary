import { describe, it, expect } from "vitest";
import { countNights } from "@/lib/nights";
describe("countNights", () => {
  it("counts nights", () => {
    expect(countNights("2026-03-27", "2026-03-30")).toBe(3);
    expect(countNights("2026-10-24", "2026-10-26")).toBe(2); // DST end in EU
    expect(countNights("2026-03-28", "2026-03-30")).toBe(2); // DST start
    expect(countNights("2026-05-01", "2026-05-01")).toBe(0);
    expect(countNights(null, "2026-05-01")).toBe(0);
    expect(countNights("2026-05-05", "2026-05-01")).toBe(0);
  });
});

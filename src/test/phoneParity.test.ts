import { describe, expect, it } from "vitest";
import { isValidPhone as clientRule } from "@/lib/bookingValidation";
import { isValidPhone as serverRule } from "../../supabase/functions/_shared/phone";

const cases = [
  "+393482303498",
  "+39 3482303498",
  "+39 347 750 4352",
  "3482303498",
  "0039 347-750-4352",
  "+238 (959) 73 80",
  "12345",
  "+1234567890123456",
  "",
];

describe("Phone rule: booking form and admin server agree", () => {
  it.each(cases)("%s", (value) => {
    expect(serverRule(value)).toBe(clientRule(value));
  });

  it("accepts a phone saved without a space after the prefix (customer profile prefill)", () => {
    expect(serverRule("+393482303498")).toBe(true);
  });

  it("rejects a phone with fewer than 6 digits", () => {
    expect(serverRule("+39 12")).toBe(false);
  });
});

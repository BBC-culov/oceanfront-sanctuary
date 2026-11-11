import { describe, expect, it } from "vitest";
import { isValidFiscalCode as clientRule } from "@/lib/bookingValidation";
import { isValidFiscalCode as serverRule } from "../../supabase/functions/_shared/fiscal-code";

const cases: Array<[string, string]> = [
  ["RSSMRA85M01H501Z", "Italia"],
  ["12345678901", "IT"],
  ["1234567890", "Italia"],
  ["DE123456789", "Germania"],
  ["12345678", "France"],
  ["1234567", "Spagna"],
  ["AB12", "Capo Verde"],
  ["ABC", "USA"],
  ["123456789", "Cabo Verde"],
  ["123456789012345678901", "USA"],
  ["", "Italia"],
];

describe("Tax ID rule: booking form and admin server agree", () => {
  it.each(cases)("%s (%s)", (value, country) => {
    expect(serverRule(value, country)).toBe(clientRule(value, country));
  });

  it("accepts a 9-digit foreign tax ID that the old server rule rejected", () => {
    expect(serverRule("123456789", "Cabo Verde")).toBe(true);
  });

  it("still rejects a 10-digit Italian code", () => {
    expect(serverRule("1234567890", "Italia")).toBe(false);
  });
});

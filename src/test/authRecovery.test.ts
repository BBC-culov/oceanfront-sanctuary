import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { auth: { onAuthStateChange: vi.fn() } },
}));

import { parseRecoveryUrl, recoveryErrorMessage } from "@/lib/authRecovery";

describe("parseRecoveryUrl", () => {
  it("recognises a recovery link with tokens in the hash", () => {
    const info = parseRecoveryUrl("#access_token=abc&refresh_token=def&type=recovery", "");
    expect(info.isRecovery).toBe(true);
    expect(info.errorCode).toBeNull();
  });

  it("reads the PKCE code from the query string", () => {
    expect(parseRecoveryUrl("", "?code=xyz").code).toBe("xyz");
  });

  it("reports an expired link instead of treating it as valid", () => {
    const info = parseRecoveryUrl("#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid", "");
    expect(info.isRecovery).toBe(false);
    expect(info.errorCode).toBe("otp_expired");
    expect(recoveryErrorMessage(info)).toContain("ultima email");
  });

  it("is not a recovery link without tokens", () => {
    expect(parseRecoveryUrl("", "").isRecovery).toBe(false);
  });
});

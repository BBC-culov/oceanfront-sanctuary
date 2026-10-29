import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, cleanup } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useApartments, useApartmentBySlug } from "@/hooks/useApartments";

const { result } = vi.hoisted(() => ({ result: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => {
      const query = {
        select: () => query,
        eq: () => query,
        order: () => query,
        maybeSingle: () => result(),
        then: (resolve: (value: unknown) => unknown) => Promise.resolve(result()).then(resolve),
      };
      return query;
    },
  },
}));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
afterEach(cleanup);

describe("database-only apartments", () => {
  it("keeps an empty database catalog empty", async () => {
    result.mockReturnValue({ data: [], error: null });
    const { result: hook } = renderHook(() => useApartments(), { wrapper });
    await waitFor(() => expect(hook.current.isSuccess).toBe(true));
    expect(hook.current.data).toEqual([]);
  });

  it("does not resurrect the former freedom example when absent", async () => {
    result.mockReturnValue({ data: null, error: null });
    const { result: hook } = renderHook(() => useApartmentBySlug("freedom"), { wrapper });
    await waitFor(() => expect(hook.current.isSuccess).toBe(true));
    expect(hook.current.data).toBeNull();
  });

  it("does not insert example photos into a real apartment without images", async () => {
    result.mockReturnValue({ data: {
      id: "real-apartment", slug: "freedom", name: "Residenza reale", images: [],
      videos: [], services: [], guests: 2, bedrooms: 1, bathrooms: 1, sqm: 45,
      category: "residence", price_per_night: 125,
    }, error: null });
    const { result: hook } = renderHook(() => useApartmentBySlug("freedom"), { wrapper });
    await waitFor(() => expect(hook.current.isSuccess).toBe(true));
    expect(hook.current.data).toMatchObject({ id: "real-apartment", name: "Residenza reale", cover: "", gallery: [], pricePerNight: 125 });
  });
});
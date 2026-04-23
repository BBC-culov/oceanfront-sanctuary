import { useUserRoles } from "./useUserRoles";

export function useAdminCheck() {
  const { isAdmin, loading } = useUserRoles();
  return { isAdmin, loading };
}

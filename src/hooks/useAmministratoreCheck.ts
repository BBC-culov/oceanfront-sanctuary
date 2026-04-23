import { useUserRoles } from "./useUserRoles";

export function useAmministratoreCheck() {
  const { isAmministratore, loading } = useUserRoles();
  return { isAmministratore, loading };
}

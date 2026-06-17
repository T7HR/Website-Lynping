import type { Role } from "@/lib/types";

export function roleLabel(role: Role) {
  if (role === "owner_dev") return "OWNER.DEV";
  return role.toUpperCase();
}

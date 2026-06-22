import { USER_ROLE_LABELS, USER_ROLES } from "@/lib/constants";
import type { UserRole } from "@/types";

export function getUserRoleLabel(role: UserRole) {
  return USER_ROLE_LABELS[role];
}

export function isSystemAdmin(role: UserRole) {
  return role === USER_ROLES.admin;
}

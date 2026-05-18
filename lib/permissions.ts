export type Role = "STORE_OWNER" | "STORE_MANAGER";

export const ROLES = {
  OWNER: "STORE_OWNER" as Role,
  MANAGER: "STORE_MANAGER" as Role,
};

export type Permission = 
  | "view_dashboard" 
  | "manage_stores" 
  | "manage_storeowners" 
  | "view_analytics";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  STORE_OWNER: [
    "view_dashboard",
    "manage_stores",
    "manage_storeowners",
    "view_analytics",
  ],
  STORE_MANAGER: [
    "view_dashboard",
    "manage_stores",
    // Store managers cannot manage store owners or view higher level analytics
  ],
};

export function hasAccess(userRole: Role, permission: Permission): boolean {
  if (!userRole) return false;
  return ROLE_PERMISSIONS[userRole]?.includes(permission);
}

// Mock user for testing the dashboard. 
// In a real scenario, this would come from Auth Context/Session.
export const mockUser = {
  id: "1",
  name: "John Doe",
  email: "owner@holdit.com",
  role: ROLES.OWNER
};
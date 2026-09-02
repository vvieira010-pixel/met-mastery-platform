export type Role = 'student' | 'teacher' | 'admin';

export type Permission =
  | 'submissions:read:own'
  | 'submissions:read:all'
  | 'submissions:write:own'
  | 'submissions:write:all'
  | 'profiles:read:self'
  | 'profiles:read:all'
  | 'profiles:update:self'
  | 'profiles:update:all';

export interface AuthUser {
  id: string;
  email: string;
  role?: string;
  [key: string]: unknown;
}

export interface AuthContext {
  userId: string;
  email: string;
  role: Role;
  permissions: Permission[];
  sessionValid: true;
  expiresAt: number;
}

export interface AuthRequestLike {
  headers: Record<string, string | string[] | undefined>;
}

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  student: ['submissions:read:own', 'submissions:write:own', 'profiles:read:self', 'profiles:update:self'],
  teacher: ['submissions:read:own', 'submissions:write:own', 'profiles:read:self', 'profiles:update:self'],
  admin: ['submissions:read:own', 'submissions:write:own', 'profiles:read:self', 'profiles:update:self', 'submissions:read:all', 'submissions:write:all', 'profiles:read:all', 'profiles:update:all'],
};

export function permissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.student;
}

export function asRole(value: unknown): Role {
  return value === 'teacher' || value === 'admin' ? value : 'student';
}

export function buildContext(user: AuthUser): AuthContext {
  const role = asRole(user.role);
  return {
    userId: user.id,
    email: user.email,
    role,
    permissions: permissionsForRole(role),
    sessionValid: true,
    expiresAt: typeof user.exp === 'number' ? user.exp : 0,
  };
}

export function hasPermission(ctx: AuthContext, perm: Permission): boolean {
  return ctx.permissions.includes(perm);
}

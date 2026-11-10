import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export type PermissionCode =
  | "dashboard.view"
  | "financials.view"
  | "products.view"
  | "products.create"
  | "products.edit"
  | "products.delete"
  | "products.purchase_price"
  | "categories.manage"
  | "inventory.view"
  | "inventory.adjust"
  | "orders.view_all"
  | "orders.view_assigned"
  | "orders.confirm"
  | "orders.process"
  | "orders.assign"
  | "orders.cancel_refund"
  | "orders.internal_notes"
  | "invoices.print"
  | "invoices.bulk_print"
  | "delivery.view"
  | "delivery.update"
  | "customers.manage"
  | "staff.manage"
  | "roles.manage"
  | "coupons.manage"
  | "payments.verify"
  | "shipping.manage"
  | "settings.manage";

export interface AuthenticatedContext {
  userId: string;
  name: string;
  email: string;
  isStaff: boolean;
  roles: string[];
  permissions: Set<string>;
  staffProfileId?: string;
}

/**
 * Resolves the effective permissions of a user from both their assigned roles
 * and any individual user-level permission overrides.
 */
export async function getUserEffectivePermissions(userId: string): Promise<AuthenticatedContext | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      staffProfile: true,
      userRoles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: { permission: true },
              },
            },
          },
        },
      },
    },
  });

  if (!user || user.status !== "ACTIVE") return null;

  const roles: string[] = [];
  const permissions = new Set<string>(user.directPermissions || []);

  for (const ur of user.userRoles) {
    roles.push(ur.role.slug);
    if (ur.role.slug === "SUPER_ADMIN") {
      permissions.add("*");
    }
    for (const rp of ur.role.rolePermissions) {
      permissions.add(rp.permission.code);
    }
  }

  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    isStaff: user.isStaff,
    roles,
    permissions,
    staffProfileId: user.staffProfile?.id,
  };
}

/**
 * Enforces RBAC permissions on the server inside Server Actions and Route Handlers.
 * Throws a 403 Forbidden error if the current session lacks the required permission.
 */
export async function requirePermission(required: PermissionCode | PermissionCode[]): Promise<AuthenticatedContext> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED: Authentication required.");
  }

  const ctx = await getUserEffectivePermissions(session.user.id);
  if (!ctx || !ctx.isStaff) {
    throw new Error("FORBIDDEN: Staff access required.");
  }

  if (ctx.permissions.has("*")) {
    return ctx;
  }

  const requiredList = Array.isArray(required) ? required : [required];
  const hasAny = requiredList.some((perm) => ctx.permissions.has(perm));

  if (!hasAny) {
    throw new Error(`FORBIDDEN: Missing required permission (${requiredList.join(" or ")}).`);
  }

  return ctx;
}

/**
 * Records an immutable staff audit log entry inside the database.
 */
export async function logStaffActivity(params: {
  ctx: AuthenticatedContext;
  action: string;
  module: string;
  targetId?: string;
  details: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.staffActivityLog.create({
    data: {
      userId: params.ctx.userId,
      staffName: params.ctx.name,
      staffRole: params.ctx.roles.join(", ") || "STAFF",
      action: params.action,
      module: params.module,
      targetId: params.targetId,
      details: params.details,
      metadata: (params.metadata as any) ?? undefined,
    },
  });
}

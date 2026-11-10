"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requirePermission, logStaffActivity } from "@/lib/permissions/rbac";
import { createRoleSchema } from "@/lib/validations/schemas";

export async function createCustomRoleAction(rawInput: unknown) {
  const ctx = await requirePermission("roles.manage");
  const parsed = createRoleSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid role data" };
  }

  const permissions = await prisma.permission.findMany({
    where: { code: { in: parsed.data.permissionCodes } },
  });

  const role = await prisma.role.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug.toUpperCase().replace(/\s+/g, "_"),
      description: parsed.data.description,
      isSystem: false,
      rolePermissions: {
        create: permissions.map((p) => ({ permissionId: p.id })),
      },
    },
  });

  await logStaffActivity({
    ctx,
    action: "CUSTOM_ROLE_CREATED",
    module: "ROLES",
    targetId: role.id,
    details: `Created custom role ${role.name} with ${permissions.length} granular permissions`,
  });

  revalidatePath("/admin/roles");
  return { success: true, role };
}

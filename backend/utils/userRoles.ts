import type { ValidUserRoleInput } from "../schemas/user.schema.js";

// Older accounts used "User" for the customer role.
export const normalizeUserRoles = (roles: string[]): ValidUserRoleInput[] =>
  Array.from(
    new Set(
      roles.map((role) =>
        role === "User" ? "Customer" : role,
      ),
    ),
  ).filter((role): role is ValidUserRoleInput =>
    ["Customer", "Merchant", "Driver", "Admin"].includes(role),
  );

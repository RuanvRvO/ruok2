import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Organizations (managed by managers)
  organizations: defineTable({
    name: v.string(),
    managerId: v.id("managers"),
    createdAt: v.number(),
  }).index("by_manager", ["managerId"]),

  // Managers (can create organizations and manage employees)
  managers: defineTable({
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  // Employees (belong to organizations and groups)
  employees: defineTable({
    email: v.string(),
    organizationId: v.id("organizations"),
    groupId: v.optional(v.id("groups")),
    createdAt: v.number(),
    isActive: v.boolean(), // Can be deactivated but not deleted (for historical data)
  })
    .index("by_organization", ["organizationId"])
    .index("by_email", ["email"])
    .index("by_group", ["groupId"]),

  // Groups within organizations
  groups: defineTable({
    name: v.string(),
    organizationId: v.id("organizations"),
    createdAt: v.number(),
  }).index("by_organization", ["organizationId"]),

  // Daily wellbeing responses from employees
  responses: defineTable({
    employeeId: v.id("employees"),
    organizationId: v.id("organizations"),
    groupId: v.optional(v.id("groups")),
    status: v.union(v.literal("green"), v.literal("amber"), v.literal("red")),
    customResponse: v.optional(v.string()),
    isAnonymous: v.boolean(), // Whether custom response is anonymous
    responseDate: v.number(), // Date of the response (normalized to start of day)
    createdAt: v.number(), // Actual timestamp when submitted
  })
    .index("by_employee", ["employeeId"])
    .index("by_organization", ["organizationId"])
    .index("by_group", ["groupId"])
    .index("by_date", ["responseDate"])
    .index("by_org_and_date", ["organizationId", "responseDate"]),

  // Email tokens for secure response links
  emailTokens: defineTable({
    token: v.string(),
    employeeId: v.id("employees"),
    expiresAt: v.number(),
    used: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_employee", ["employeeId"]),

  // Legacy users table (kept for compatibility)
  users: defineTable({
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),
});

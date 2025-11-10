import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new organization
export const createOrganization = mutation({
  args: {
    name: v.string(),
    managerId: v.id("managers"),
    employeeEmails: v.array(v.string()), // Array of employee emails to add
  },
  handler: async (ctx, args) => {
    // Validate organization name
    if (!args.name.trim()) {
      throw new Error("Organization name is required");
    }

    // Create the organization
    const organizationId = await ctx.db.insert("organizations", {
      name: args.name,
      managerId: args.managerId,
      createdAt: Date.now(),
    });

    // Add employees
    const employeeIds = [];
    for (const email of args.employeeEmails) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(email.trim())) {
        const employeeId = await ctx.db.insert("employees", {
          email: email.toLowerCase().trim(),
          organizationId: organizationId,
          groupId: undefined,
          createdAt: Date.now(),
          isActive: true,
        });
        employeeIds.push(employeeId);
      }
    }

    return {
      success: true,
      organizationId: organizationId,
      employeesAdded: employeeIds.length,
    };
  },
});

// Get organization by manager ID
export const getOrganizationByManager = query({
  args: {
    managerId: v.id("managers"),
  },
  handler: async (ctx, args) => {
    const organization = await ctx.db
      .query("organizations")
      .withIndex("by_manager", (q) => q.eq("managerId", args.managerId))
      .first();

    return organization;
  },
});

// Get organization details with stats
export const getOrganizationDetails = query({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const organization = await ctx.db.get(args.organizationId);
    if (!organization) {
      return null;
    }

    // Get employee count
    const employees = await ctx.db
      .query("employees")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Get group count
    const groups = await ctx.db
      .query("groups")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .collect();

    return {
      ...organization,
      employeeCount: employees.length,
      groupCount: groups.length,
    };
  },
});

// Update organization name
export const updateOrganization = mutation({
  args: {
    organizationId: v.id("organizations"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.organizationId, {
      name: args.name,
    });

    return { success: true };
  },
});

// Get all organizations (for cron jobs)
export const getAllOrganizations = query({
  handler: async (ctx) => {
    const organizations = await ctx.db.query("organizations").collect();
    return organizations;
  },
});

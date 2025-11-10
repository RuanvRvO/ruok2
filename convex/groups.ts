import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new group
export const createGroup = mutation({
  args: {
    name: v.string(),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    if (!args.name.trim()) {
      throw new Error("Group name is required");
    }

    // Check if group with this name already exists in the organization
    const existingGroup = await ctx.db
      .query("groups")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (existingGroup) {
      throw new Error("Group with this name already exists");
    }

    const groupId = await ctx.db.insert("groups", {
      name: args.name,
      organizationId: args.organizationId,
      createdAt: Date.now(),
    });

    return {
      success: true,
      groupId: groupId,
    };
  },
});

// Get all groups in an organization
export const getGroupsByOrganization = query({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const groups = await ctx.db
      .query("groups")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .collect();

    // Get employee count for each group
    const groupsWithCounts = await Promise.all(
      groups.map(async (group) => {
        const employees = await ctx.db
          .query("employees")
          .withIndex("by_group", (q) => q.eq("groupId", group._id))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect();

        return {
          ...group,
          employeeCount: employees.length,
        };
      })
    );

    return groupsWithCounts;
  },
});

// Update group name
export const updateGroup = mutation({
  args: {
    groupId: v.id("groups"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.name.trim()) {
      throw new Error("Group name is required");
    }

    await ctx.db.patch(args.groupId, {
      name: args.name,
    });

    return { success: true };
  },
});

// Delete group
export const deleteGroup = mutation({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    // Remove group assignment from all employees in this group
    const employees = await ctx.db
      .query("employees")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    for (const employee of employees) {
      await ctx.db.patch(employee._id, {
        groupId: undefined,
      });
    }

    // Delete the group
    await ctx.db.delete(args.groupId);

    return { success: true };
  },
});

// Get employees in a specific group
export const getEmployeesByGroup = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const employees = await ctx.db
      .query("employees")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return employees;
  },
});

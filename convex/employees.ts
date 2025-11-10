import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Add a new employee to an organization
export const addEmployee = mutation({
  args: {
    email: v.string(),
    organizationId: v.id("organizations"),
    groupId: v.optional(v.id("groups")),
  },
  handler: async (ctx, args) => {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("Invalid email format");
    }

    // Check if employee already exists in this organization
    const existingEmployee = await ctx.db
      .query("employees")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .filter((q) => q.eq(q.field("email"), args.email.toLowerCase()))
      .first();

    if (existingEmployee) {
      throw new Error("Employee already exists in this organization");
    }

    // Create employee
    const employeeId = await ctx.db.insert("employees", {
      email: args.email.toLowerCase(),
      organizationId: args.organizationId,
      groupId: args.groupId,
      createdAt: Date.now(),
      isActive: true,
    });

    return {
      success: true,
      employeeId: employeeId,
    };
  },
});

// Add multiple employees at once
export const addMultipleEmployees = mutation({
  args: {
    emails: v.array(v.string()),
    organizationId: v.id("organizations"),
    groupId: v.optional(v.id("groups")),
  },
  handler: async (ctx, args) => {
    const results = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (const email of args.emails) {
      if (!emailRegex.test(email.trim())) {
        results.push({ email, success: false, error: "Invalid email format" });
        continue;
      }

      // Check if employee already exists
      const existingEmployee = await ctx.db
        .query("employees")
        .withIndex("by_organization", (q) =>
          q.eq("organizationId", args.organizationId)
        )
        .filter((q) => q.eq(q.field("email"), email.toLowerCase().trim()))
        .first();

      if (existingEmployee) {
        results.push({
          email,
          success: false,
          error: "Already exists",
        });
        continue;
      }

      // Create employee
      const employeeId = await ctx.db.insert("employees", {
        email: email.toLowerCase().trim(),
        organizationId: args.organizationId,
        groupId: args.groupId,
        createdAt: Date.now(),
        isActive: true,
      });

      results.push({ email, success: true, employeeId });
    }

    return results;
  },
});

// Get all employees in an organization
export const getEmployeesByOrganization = query({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const employees = await ctx.db
      .query("employees")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Get group names for each employee
    const employeesWithGroups = await Promise.all(
      employees.map(async (employee) => {
        let groupName = null;
        if (employee.groupId) {
          const group = await ctx.db.get(employee.groupId);
          groupName = group?.name || null;
        }
        return {
          ...employee,
          groupName,
        };
      })
    );

    return employeesWithGroups;
  },
});

// Update employee group
export const updateEmployeeGroup = mutation({
  args: {
    employeeId: v.id("employees"),
    groupId: v.optional(v.id("groups")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.employeeId, {
      groupId: args.groupId,
    });

    return { success: true };
  },
});

// Deactivate employee (soft delete)
export const deactivateEmployee = mutation({
  args: {
    employeeId: v.id("employees"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.employeeId, {
      isActive: false,
    });

    return { success: true };
  },
});

// Reactivate employee
export const reactivateEmployee = mutation({
  args: {
    employeeId: v.id("employees"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.employeeId, {
      isActive: true,
    });

    return { success: true };
  },
});

// Delete employee permanently
export const deleteEmployee = mutation({
  args: {
    employeeId: v.id("employees"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.employeeId);
    return { success: true };
  },
});

// Get employee by email
export const getEmployeeByEmail = query({
  args: {
    email: v.string(),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const employee = await ctx.db
      .query("employees")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .filter((q) => q.eq(q.field("email"), args.email.toLowerCase()))
      .first();

    return employee;
  },
});

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Submit a wellbeing response
export const submitResponse = mutation({
  args: {
    employeeId: v.id("employees"),
    status: v.union(v.literal("green"), v.literal("amber"), v.literal("red")),
    customResponse: v.optional(v.string()),
    isAnonymous: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Get employee details
    const employee = await ctx.db.get(args.employeeId);
    if (!employee || !employee.isActive) {
      throw new Error("Employee not found or inactive");
    }

    // Normalize date to start of day (UTC)
    const now = new Date();
    const responseDate = new Date(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    ).getTime();

    // Check if employee already submitted response today
    const existingResponse = await ctx.db
      .query("responses")
      .withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId))
      .filter((q) => q.eq(q.field("responseDate"), responseDate))
      .first();

    if (existingResponse) {
      // Update existing response
      await ctx.db.patch(existingResponse._id, {
        status: args.status,
        customResponse: args.customResponse,
        isAnonymous: args.isAnonymous,
        createdAt: Date.now(),
      });

      return {
        success: true,
        responseId: existingResponse._id,
        updated: true,
      };
    }

    // Create new response
    const responseId = await ctx.db.insert("responses", {
      employeeId: args.employeeId,
      organizationId: employee.organizationId,
      groupId: employee.groupId,
      status: args.status,
      customResponse: args.customResponse,
      isAnonymous: args.isAnonymous,
      responseDate: responseDate,
      createdAt: Date.now(),
    });

    return {
      success: true,
      responseId: responseId,
      updated: false,
    };
  },
});

// Get responses for an employee
export const getEmployeeResponses = query({
  args: {
    employeeId: v.id("employees"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 30;
    const responses = await ctx.db
      .query("responses")
      .withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId))
      .order("desc")
      .take(limit);

    return responses;
  },
});

// Check if employee has responded today
export const hasRespondedToday = query({
  args: {
    employeeId: v.id("employees"),
  },
  handler: async (ctx, args) => {
    const now = new Date();
    const responseDate = new Date(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    ).getTime();

    const response = await ctx.db
      .query("responses")
      .withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId))
      .filter((q) => q.eq(q.field("responseDate"), responseDate))
      .first();

    return {
      hasResponded: !!response,
      response: response || null,
    };
  },
});

// Get responses by organization for a date range
export const getOrganizationResponses = query({
  args: {
    organizationId: v.id("organizations"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let responsesQuery = ctx.db
      .query("responses")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      );

    const responses = await responsesQuery.collect();

    // Filter by date range if provided
    let filteredResponses = responses;
    if (args.startDate || args.endDate) {
      filteredResponses = responses.filter((r) => {
        if (args.startDate && r.responseDate < args.startDate) return false;
        if (args.endDate && r.responseDate > args.endDate) return false;
        return true;
      });
    }

    return filteredResponses;
  },
});

// Get responses by group for a date range
export const getGroupResponses = query({
  args: {
    groupId: v.id("groups"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const responses = await ctx.db
      .query("responses")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    // Filter by date range if provided
    let filteredResponses = responses;
    if (args.startDate || args.endDate) {
      filteredResponses = responses.filter((r) => {
        if (args.startDate && r.responseDate < args.startDate) return false;
        if (args.endDate && r.responseDate > args.endDate) return false;
        return true;
      });
    }

    return filteredResponses;
  },
});

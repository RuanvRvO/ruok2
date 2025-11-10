import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============================================================================
// MANAGER FUNCTIONS
// ============================================================================

export const registerManager = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate inputs
    if (!args.name.trim() || !args.email.trim()) {
      throw new Error("Name and email are required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("Invalid email format");
    }

    if (args.password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    // Check for existing manager
    const existing = await ctx.db
      .query("managers")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existing) {
      throw new Error("Manager with this email already exists");
    }

    // Insert manager
    const managerId = await ctx.db.insert("managers", {
      name: args.name,
      email: args.email.toLowerCase(),
      passwordHash: args.password, // TODO: Hash in production
      createdAt: Date.now(),
    });

    return { _id: managerId, name: args.name, email: args.email };
  },
});

export const loginManager = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const manager = await ctx.db
      .query("managers")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!manager) {
      throw new Error("No account found with this email address. Please create an account first.");
    }

    if (manager.passwordHash !== args.password) {
      throw new Error("Incorrect password. Please try again.");
    }

    return {
      _id: manager._id,
      name: manager.name,
      email: manager.email,
      createdAt: manager.createdAt,
    };
  },
});

export const getManager = query({
  args: { managerId: v.id("managers") },
  handler: async (ctx, args) => {
    const manager = await ctx.db.get(args.managerId);
    if (!manager) return null;

    return {
      _id: manager._id,
      name: manager.name,
      email: manager.email,
      createdAt: manager.createdAt,
    };
  },
});

// ============================================================================
// ORGANIZATION FUNCTIONS
// ============================================================================

export const createOrganization = mutation({
  args: {
    name: v.string(),
    managerId: v.id("managers"),
    employeeEmails: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    if (!args.name.trim()) {
      throw new Error("Organization name is required");
    }

    // Create organization
    const orgId = await ctx.db.insert("organizations", {
      name: args.name,
      managerId: args.managerId,
      createdAt: Date.now(),
    });

    // Add employees if provided
    if (args.employeeEmails && args.employeeEmails.length > 0) {
      for (const email of args.employeeEmails) {
        if (email.trim()) {
          await ctx.db.insert("employees", {
            email: email.trim().toLowerCase(),
            organizationId: orgId,
            createdAt: Date.now(),
            isActive: true,
          });
        }
      }
    }

    return { _id: orgId, name: args.name };
  },
});

export const getOrganizationByManager = query({
  args: { managerId: v.id("managers") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("organizations")
      .withIndex("by_manager", (q) => q.eq("managerId", args.managerId))
      .first();
  },
});

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

export const getAllOrganizations = query({
  handler: async (ctx) => {
    return await ctx.db.query("organizations").collect();
  },
});

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
      .filter((q) =>
        q.and(
          q.eq(q.field("organizationId"), args.organizationId),
          q.eq(q.field("isActive"), true)
        )
      )
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

// ============================================================================
// EMPLOYEE FUNCTIONS
// ============================================================================

export const addEmployee = mutation({
  args: {
    email: v.string(),
    organizationId: v.id("organizations"),
    groupId: v.optional(v.id("groups")),
  },
  handler: async (ctx, args) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("Invalid email format");
    }

    // Check if employee already exists
    const existing = await ctx.db
      .query("employees")
      .filter((q) =>
        q.and(
          q.eq(q.field("email"), args.email.toLowerCase()),
          q.eq(q.field("organizationId"), args.organizationId)
        )
      )
      .first();

    if (existing) {
      throw new Error("Employee already exists in this organization");
    }

    const employeeId = await ctx.db.insert("employees", {
      email: args.email.toLowerCase(),
      organizationId: args.organizationId,
      groupId: args.groupId,
      createdAt: Date.now(),
      isActive: true,
    });

    return { _id: employeeId };
  },
});

export const addMultipleEmployees = mutation({
  args: {
    emails: v.array(v.string()),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const results = [];
    for (const email of args.emails) {
      if (!email.trim()) continue;

      try {
        const employeeId = await ctx.db.insert("employees", {
          email: email.trim().toLowerCase(),
          organizationId: args.organizationId,
          createdAt: Date.now(),
          isActive: true,
        });
        results.push({ email, success: true, id: employeeId });
      } catch (error) {
        results.push({ email, success: false, error: String(error) });
      }
    }
    return results;
  },
});

export const getEmployeesByOrganization = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("employees")
      .filter((q) => q.eq(q.field("organizationId"), args.organizationId))
      .collect();
  },
});

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

export const deactivateEmployee = mutation({
  args: { employeeId: v.id("employees") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.employeeId, { isActive: false });
    return { success: true };
  },
});

export const deleteEmployee = mutation({
  args: { employeeId: v.id("employees") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.employeeId);
    return { success: true };
  },
});

// ============================================================================
// GROUP FUNCTIONS
// ============================================================================

export const createGroup = mutation({
  args: {
    name: v.string(),
    organizationId: v.id("organizations"),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const groupId = await ctx.db.insert("groups", {
      name: args.name,
      organizationId: args.organizationId,
      description: args.description,
      createdAt: Date.now(),
    });
    return { _id: groupId, name: args.name };
  },
});

export const getGroupsByOrganization = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("groups")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();
  },
});

export const updateGroup = mutation({
  args: {
    groupId: v.id("groups"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.groupId, {
      name: args.name,
      description: args.description,
    });
    return { success: true };
  },
});

export const deleteGroup = mutation({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    // Clear groupId from employees in this group
    const employees = await ctx.db
      .query("employees")
      .filter((q) => q.eq(q.field("groupId"), args.groupId))
      .collect();

    for (const employee of employees) {
      await ctx.db.patch(employee._id, { groupId: undefined });
    }

    await ctx.db.delete(args.groupId);
    return { success: true };
  },
});

export const getEmployeesByGroup = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("employees")
      .filter((q) => q.eq(q.field("groupId"), args.groupId))
      .collect();
  },
});

// ============================================================================
// RESPONSE FUNCTIONS
// ============================================================================

export const submitResponse = mutation({
  args: {
    employeeId: v.id("employees"),
    status: v.union(v.literal("green"), v.literal("amber"), v.literal("red")),
    text: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    // Check if already responded today
    const existingResponse = await ctx.db
      .query("responses")
      .withIndex("by_employee_date", (q) =>
        q.eq("employeeId", args.employeeId).eq("date", todayTimestamp)
      )
      .first();

    if (existingResponse) {
      // Update existing response
      await ctx.db.patch(existingResponse._id, {
        status: args.status,
        text: args.text,
        isAnonymous: args.isAnonymous ?? false,
      });
      return { _id: existingResponse._id, updated: true };
    }

    // Create new response
    const responseId = await ctx.db.insert("responses", {
      employeeId: args.employeeId,
      date: todayTimestamp,
      status: args.status,
      text: args.text,
      isAnonymous: args.isAnonymous ?? false,
      createdAt: Date.now(),
    });

    return { _id: responseId, updated: false };
  },
});

export const getEmployeeResponses = query({
  args: { employeeId: v.id("employees") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("responses")
      .withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId))
      .collect();
  },
});

export const hasRespondedToday = query({
  args: { employeeId: v.id("employees") },
  handler: async (ctx, args) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const response = await ctx.db
      .query("responses")
      .withIndex("by_employee_date", (q) =>
        q.eq("employeeId", args.employeeId).eq("date", todayTimestamp)
      )
      .first();

    return !!response;
  },
});

export const getOrganizationResponses = query({
  args: {
    organizationId: v.id("organizations"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const employees = await ctx.db
      .query("employees")
      .filter((q) => q.eq(q.field("organizationId"), args.organizationId))
      .collect();

    const employeeIds = employees.map((e) => e._id);
    const responses = [];

    for (const empId of employeeIds) {
      const empResponses = await ctx.db
        .query("responses")
        .withIndex("by_employee", (q) => q.eq("employeeId", empId))
        .collect();

      for (const response of empResponses) {
        if (args.startDate && response.date < args.startDate) continue;
        if (args.endDate && response.date > args.endDate) continue;
        responses.push(response);
      }
    }

    return responses;
  },
});

export const getGroupResponses = query({
  args: {
    groupId: v.id("groups"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const employees = await ctx.db
      .query("employees")
      .filter((q) => q.eq(q.field("groupId"), args.groupId))
      .collect();

    const employeeIds = employees.map((e) => e._id);
    const responses = [];

    for (const empId of employeeIds) {
      const empResponses = await ctx.db
        .query("responses")
        .withIndex("by_employee", (q) => q.eq("employeeId", empId))
        .collect();

      for (const response of empResponses) {
        if (args.startDate && response.date < args.startDate) continue;
        if (args.endDate && response.date > args.endDate) continue;
        responses.push(response);
      }
    }

    return responses;
  },
});

// ============================================================================
// ANALYTICS FUNCTIONS
// ============================================================================

function calculateAverageStatus(responses: Array<{ status: string }>) {
  if (responses.length === 0) return { average: 0, status: "red" };

  const statusValues: Record<string, number> = { green: 3, amber: 2, red: 1 };
  const sum = responses.reduce((acc, r) => acc + (statusValues[r.status] || 0), 0);
  const average = sum / responses.length;

  let status = "red";
  if (average >= 2.5) status = "green";
  else if (average >= 1.5) status = "amber";

  return { average, status };
}

export const getOrganizationAnalytics = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    // Get all employees
    const employees = await ctx.db
      .query("employees")
      .filter((q) => q.eq(q.field("organizationId"), args.organizationId))
      .collect();

    const activeEmployees = employees.filter((e) => e.isActive);
    const employeeIds = activeEmployees.map((e) => e._id);

    // Get responses for last 30 days
    const allResponses = [];
    for (const empId of employeeIds) {
      const empResponses = await ctx.db
        .query("responses")
        .withIndex("by_employee", (q) => q.eq("employeeId", empId))
        .collect();

      allResponses.push(...empResponses.filter((r) => r.date >= thirtyDaysAgo));
    }

    // Today's responses
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    const todayResponses = allResponses.filter((r) => r.date === todayTimestamp);

    // Calculate metrics
    const totalEmployees = activeEmployees.length;
    const responsesToday = todayResponses.length;
    const responseRate = totalEmployees > 0 ? (responsesToday / totalEmployees) * 100 : 0;

    const statusDistribution = {
      green: todayResponses.filter((r) => r.status === "green").length,
      amber: todayResponses.filter((r) => r.status === "amber").length,
      red: todayResponses.filter((r) => r.status === "red").length,
    };

    const overallStatus = calculateAverageStatus(todayResponses);

    // 30-day trend
    const trendData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dateTimestamp = date.getTime();

      const dayResponses = allResponses.filter((r) => r.date === dateTimestamp);
      const dayStatus = calculateAverageStatus(dayResponses);

      trendData.push({
        date: dateTimestamp,
        ...dayStatus,
        responseCount: dayResponses.length,
      });
    }

    return {
      totalEmployees,
      responsesToday,
      responseRate,
      statusDistribution,
      overallStatus: overallStatus.status,
      trendData,
    };
  },
});

export const getGroupAnalytics = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const groups = await ctx.db
      .query("groups")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const groupAnalytics = [];

    for (const group of groups) {
      const employees = await ctx.db
        .query("employees")
        .filter((q) => q.eq(q.field("groupId"), group._id))
        .collect();

      const activeEmployees = employees.filter((e) => e.isActive);
      const employeeIds = activeEmployees.map((e) => e._id);

      const todayResponses = [];
      for (const empId of employeeIds) {
        const response = await ctx.db
          .query("responses")
          .withIndex("by_employee_date", (q) =>
            q.eq("employeeId", empId).eq("date", todayTimestamp)
          )
          .first();

        if (response) todayResponses.push(response);
      }

      const status = calculateAverageStatus(todayResponses);
      const responseRate =
        activeEmployees.length > 0
          ? (todayResponses.length / activeEmployees.length) * 100
          : 0;

      groupAnalytics.push({
        groupId: group._id,
        groupName: group.name,
        totalEmployees: activeEmployees.length,
        responsesToday: todayResponses.length,
        responseRate,
        status: status.status,
        averageScore: status.average,
      });
    }

    return groupAnalytics;
  },
});

export const getRecentResponses = query({
  args: {
    organizationId: v.id("organizations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    const employees = await ctx.db
      .query("employees")
      .filter((q) => q.eq(q.field("organizationId"), args.organizationId))
      .collect();

    const employeeMap = new Map(employees.map((e) => [e._id, e]));
    const allResponses = [];

    for (const employee of employees) {
      const responses = await ctx.db
        .query("responses")
        .withIndex("by_employee", (q) => q.eq("employeeId", employee._id))
        .collect();

      allResponses.push(...responses);
    }

    // Sort by date descending
    allResponses.sort((a, b) => b.date - a.date);

    return allResponses.slice(0, limit).map((response) => {
      const employee = employeeMap.get(response.employeeId);
      return {
        ...response,
        employeeEmail: response.isAnonymous ? "Anonymous" : employee?.email,
      };
    });
  },
});

// ============================================================================
// EMAIL TOKEN FUNCTIONS
// ============================================================================

export const generateEmailToken = mutation({
  args: { employeeId: v.id("employees") },
  handler: async (ctx, args) => {
    const token = crypto.randomUUID();
    const expiresAt = Date.now() + 48 * 60 * 60 * 1000; // 48 hours

    const tokenId = await ctx.db.insert("emailTokens", {
      token,
      employeeId: args.employeeId,
      expiresAt,
      used: false,
      createdAt: Date.now(),
    });

    return { tokenId, token };
  },
});

export const validateToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const tokenRecord = await ctx.db
      .query("emailTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!tokenRecord) {
      throw new Error("Invalid token");
    }

    if (tokenRecord.used) {
      throw new Error("Token already used");
    }

    if (tokenRecord.expiresAt < Date.now()) {
      throw new Error("Token expired");
    }

    const employee = await ctx.db.get(tokenRecord.employeeId);
    if (!employee) {
      throw new Error("Employee not found");
    }

    return {
      tokenId: tokenRecord._id,
      employeeId: tokenRecord.employeeId,
      employee,
    };
  },
});

export const markTokenUsed = mutation({
  args: { tokenId: v.id("emailTokens") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.tokenId, { used: true });
    return { success: true };
  },
});

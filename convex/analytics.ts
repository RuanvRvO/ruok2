import { v } from "convex/values";
import { query } from "./_generated/server";

// Calculate average wellbeing status
// Green = 3, Amber = 2, Red = 1
function calculateAverageStatus(responses: Array<{ status: string }>) {
  if (responses.length === 0) return { average: 0, status: "none" };

  const statusValues = { green: 3, amber: 2, red: 1 };
  const sum = responses.reduce(
    (acc, r) => acc + statusValues[r.status as keyof typeof statusValues],
    0
  );
  const average = sum / responses.length;

  let status = "red";
  if (average >= 2.5) status = "green";
  else if (average >= 1.5) status = "amber";

  return { average, status };
}

// Get organization-wide analytics
export const getOrganizationAnalytics = query({
  args: {
    organizationId: v.id("organizations"),
    days: v.optional(v.number()), // Number of days to look back (default 30)
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const now = Date.now();
    const startDate = now - days * 24 * 60 * 60 * 1000;

    // Get all active employees
    const employees = await ctx.db
      .query("employees")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Get responses in the date range
    const responses = await ctx.db
      .query("responses")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .collect();

    const filteredResponses = responses.filter(
      (r) => r.responseDate >= startDate
    );

    // Calculate overall stats
    const overallStats = calculateAverageStatus(filteredResponses);

    // Calculate status distribution
    const statusCounts = {
      green: filteredResponses.filter((r) => r.status === "green").length,
      amber: filteredResponses.filter((r) => r.status === "amber").length,
      red: filteredResponses.filter((r) => r.status === "red").length,
    };

    // Calculate response rate
    const today = new Date();
    const todayDate = new Date(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate()
    ).getTime();
    const todayResponses = filteredResponses.filter(
      (r) => r.responseDate === todayDate
    );
    const responseRate =
      employees.length > 0
        ? (todayResponses.length / employees.length) * 100
        : 0;

    // Group responses by day for trend data
    const dailyStats = new Map<number, Array<{ status: string }>>();
    filteredResponses.forEach((r) => {
      const existing = dailyStats.get(r.responseDate) || [];
      existing.push({ status: r.status });
      dailyStats.set(r.responseDate, existing);
    });

    const trendData = Array.from(dailyStats.entries())
      .map(([date, dayResponses]) => ({
        date,
        ...calculateAverageStatus(dayResponses),
        count: dayResponses.length,
      }))
      .sort((a, b) => a.date - b.date);

    return {
      overallStatus: overallStats.status,
      overallAverage: overallStats.average,
      totalResponses: filteredResponses.length,
      statusCounts,
      responseRate: Math.round(responseRate),
      totalEmployees: employees.length,
      trendData,
    };
  },
});

// Get analytics by group
export const getGroupAnalytics = query({
  args: {
    organizationId: v.id("organizations"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const now = Date.now();
    const startDate = now - days * 24 * 60 * 60 * 1000;

    // Get all groups
    const groups = await ctx.db
      .query("groups")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .collect();

    const groupAnalytics = await Promise.all(
      groups.map(async (group) => {
        // Get employees in this group
        const employees = await ctx.db
          .query("employees")
          .withIndex("by_group", (q) => q.eq("groupId", group._id))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect();

        // Get responses for this group
        const responses = await ctx.db
          .query("responses")
          .withIndex("by_group", (q) => q.eq("groupId", group._id))
          .collect();

        const filteredResponses = responses.filter(
          (r) => r.responseDate >= startDate
        );

        const stats = calculateAverageStatus(filteredResponses);

        const statusCounts = {
          green: filteredResponses.filter((r) => r.status === "green").length,
          amber: filteredResponses.filter((r) => r.status === "amber").length,
          red: filteredResponses.filter((r) => r.status === "red").length,
        };

        return {
          groupId: group._id,
          groupName: group.name,
          status: stats.status,
          average: stats.average,
          totalResponses: filteredResponses.length,
          employeeCount: employees.length,
          statusCounts,
        };
      })
    );

    // Also get analytics for employees without a group
    const ungroupedEmployees = await ctx.db
      .query("employees")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .filter((q) =>
        q.and(q.eq(q.field("isActive"), true), q.eq(q.field("groupId"), undefined))
      )
      .collect();

    if (ungroupedEmployees.length > 0) {
      const ungroupedResponses = await Promise.all(
        ungroupedEmployees.map(async (emp) => {
          const responses = await ctx.db
            .query("responses")
            .withIndex("by_employee", (q) => q.eq("employeeId", emp._id))
            .collect();
          return responses.filter((r) => r.responseDate >= startDate);
        })
      );

      const flattenedResponses = ungroupedResponses.flat();
      const stats = calculateAverageStatus(flattenedResponses);

      const statusCounts = {
        green: flattenedResponses.filter((r) => r.status === "green").length,
        amber: flattenedResponses.filter((r) => r.status === "amber").length,
        red: flattenedResponses.filter((r) => r.status === "red").length,
      };

      groupAnalytics.push({
        groupId: "ungrouped" as any,
        groupName: "No Group",
        status: stats.status,
        average: stats.average,
        totalResponses: flattenedResponses.length,
        employeeCount: ungroupedEmployees.length,
        statusCounts,
      });
    }

    return groupAnalytics;
  },
});

// Get recent responses with details (for manager view)
export const getRecentResponses = query({
  args: {
    organizationId: v.id("organizations"),
    limit: v.optional(v.number()),
    includeAnonymous: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const includeAnonymous = args.includeAnonymous !== false;

    const responses = await ctx.db
      .query("responses")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .order("desc")
      .take(limit);

    // Enrich responses with employee and group info
    const enrichedResponses = await Promise.all(
      responses.map(async (response) => {
        const employee = await ctx.db.get(response.employeeId);
        let groupName = null;
        if (response.groupId) {
          const group = await ctx.db.get(response.groupId);
          groupName = group?.name || null;
        }

        return {
          ...response,
          employeeEmail: employee?.email || "Unknown",
          groupName,
          // Hide custom response if anonymous and includeAnonymous is false
          customResponse:
            response.isAnonymous && !includeAnonymous
              ? "[Anonymous]"
              : response.customResponse,
        };
      })
    );

    return enrichedResponses;
  },
});

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate a unique token for employee response link
export const generateEmailToken = mutation({
  args: {
    employeeId: v.id("employees"),
  },
  handler: async (ctx, args) => {
    // Generate a random token
    const token = generateRandomToken();

    // Token expires in 48 hours
    const expiresAt = Date.now() + 48 * 60 * 60 * 1000;

    const tokenId = await ctx.db.insert("emailTokens", {
      token,
      employeeId: args.employeeId,
      expiresAt,
      used: false,
      createdAt: Date.now(),
    });

    return {
      success: true,
      token,
      tokenId,
    };
  },
});

// Validate and get employee from token
export const validateToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const emailToken = await ctx.db
      .query("emailTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!emailToken) {
      return { valid: false, error: "Invalid token" };
    }

    if (emailToken.used) {
      return { valid: false, error: "Token already used" };
    }

    if (emailToken.expiresAt < Date.now()) {
      return { valid: false, error: "Token expired" };
    }

    const employee = await ctx.db.get(emailToken.employeeId);
    if (!employee || !employee.isActive) {
      return { valid: false, error: "Employee not found" };
    }

    return {
      valid: true,
      employeeId: emailToken.employeeId,
      employee,
    };
  },
});

// Mark token as used (optional, tokens can be reused for convenience)
export const markTokenUsed = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const emailToken = await ctx.db
      .query("emailTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!emailToken) {
      throw new Error("Token not found");
    }

    await ctx.db.patch(emailToken._id, {
      used: true,
    });

    return { success: true };
  },
});

// Helper function to generate random token
function generateRandomToken(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

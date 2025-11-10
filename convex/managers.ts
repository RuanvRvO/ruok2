import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Register a new manager
export const registerManager = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate inputs
    if (!args.name.trim()) {
      throw new Error("Name is required");
    }

    if (!args.email.trim()) {
      throw new Error("Email is required");
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("Invalid email format");
    }

    if (args.password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    // Check if manager with this email already exists
    const existingManager = await ctx.db
      .query("managers")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existingManager) {
      throw new Error("Email already registered");
    }

    // In production, hash the password properly (using bcrypt on the server side)
    const passwordHash = args.password; // TODO: Add proper password hashing

    // Insert the new manager
    const managerId = await ctx.db.insert("managers", {
      name: args.name,
      email: args.email.toLowerCase(),
      passwordHash: passwordHash,
      createdAt: Date.now(),
    });

    return {
      success: true,
      managerId: managerId,
      message: "Registration successful",
    };
  },
});

// Login manager
export const loginManager = query({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Find manager by email
    const manager = await ctx.db
      .query("managers")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!manager) {
      throw new Error("Invalid email or password");
    }

    // Check password (in production, use proper comparison)
    if (manager.passwordHash !== args.password) {
      throw new Error("Invalid email or password");
    }

    // Return manager data (without password)
    return {
      _id: manager._id,
      name: manager.name,
      email: manager.email,
      createdAt: manager.createdAt,
    };
  },
});

// Get manager by ID
export const getManager = query({
  args: {
    managerId: v.id("managers"),
  },
  handler: async (ctx, args) => {
    const manager = await ctx.db.get(args.managerId);

    if (!manager) {
      return null;
    }

    return {
      _id: manager._id,
      name: manager.name,
      email: manager.email,
      createdAt: manager.createdAt,
    };
  },
});

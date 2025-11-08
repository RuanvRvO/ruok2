import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Register a new user
export const registerUser = mutation({
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

    // Check if user with this email already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existingUser) {
      throw new Error("Email already registered");
    }

    // In a production app, you should hash the password using bcrypt or similar
    // For now, we'll store it directly (NOT RECOMMENDED for production!)
    // TODO: Add proper password hashing with bcrypt
    const passwordHash = args.password; // This should be hashed!

    // Insert the new user
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email.toLowerCase(),
      passwordHash: passwordHash,
      createdAt: Date.now(),
    });

    return {
      success: true,
      userId: userId,
      message: "Registration successful",
    };
  },
});

// Optional: Query to get user by email (useful for login later)
export const getUserByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!user) {
      return null;
    }

    // Don't return the password hash to the client!
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  },
});

// Login function - validates credentials
export const loginUser = query({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Check password (in production, use bcrypt.compare!)
    // This is comparing plain text - NOT SECURE for production!
    if (user.passwordHash !== args.password) {
      throw new Error("Invalid email or password");
    }

    // Return user data (without password)
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  },
});

// Optional: Get all users (for admin panel later)
export const getAllUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    
    // Don't return password hashes
    return users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    }));
  },
});
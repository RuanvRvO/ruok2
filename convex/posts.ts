import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new post
export const createPost = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    published: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (!args.title.trim()) {
      throw new Error("Title is required");
    }

    if (!args.content.trim()) {
      throw new Error("Content is required");
    }

    const postId = await ctx.db.insert("posts", {
      userId: args.userId,
      title: args.title,
      content: args.content,
      published: args.published,
      createdAt: Date.now(),
    });

    return {
      success: true,
      postId,
      message: "Post created successfully",
    };
  },
});

// Get all published posts
export const getPublishedPosts = query({
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .order("desc")
      .collect();

    // Get user info for each post
    const postsWithUsers = await Promise.all(
      posts.map(async (post) => {
        const user = await ctx.db.get(post.userId);
        return {
          ...post,
          author: user
            ? { name: user.name, email: user.email, avatar: user.avatar }
            : null,
        };
      })
    );

    return postsWithUsers;
  },
});

// Get posts by user
export const getPostsByUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return posts;
  },
});

// Get a single post by ID
export const getPost = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);

    if (!post) {
      return null;
    }

    const user = await ctx.db.get(post.userId);

    return {
      ...post,
      author: user
        ? { name: user.name, email: user.email, avatar: user.avatar }
        : null,
    };
  },
});

// Update a post
export const updatePost = mutation({
  args: {
    postId: v.id("posts"),
    userId: v.id("users"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    published: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);

    if (!post) {
      throw new Error("Post not found");
    }

    if (post.userId !== args.userId) {
      throw new Error("Unauthorized: You can only edit your own posts");
    }

    const updates: {
      title?: string;
      content?: string;
      published?: boolean;
      updatedAt: number;
    } = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) {
      if (!args.title.trim()) {
        throw new Error("Title cannot be empty");
      }
      updates.title = args.title;
    }

    if (args.content !== undefined) {
      if (!args.content.trim()) {
        throw new Error("Content cannot be empty");
      }
      updates.content = args.content;
    }

    if (args.published !== undefined) {
      updates.published = args.published;
    }

    await ctx.db.patch(args.postId, updates);

    return {
      success: true,
      message: "Post updated successfully",
    };
  },
});

// Delete a post
export const deletePost = mutation({
  args: {
    postId: v.id("posts"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);

    if (!post) {
      throw new Error("Post not found");
    }

    if (post.userId !== args.userId) {
      throw new Error("Unauthorized: You can only delete your own posts");
    }

    // Delete all comments on this post first
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    // Delete the post
    await ctx.db.delete(args.postId);

    return {
      success: true,
      message: "Post deleted successfully",
    };
  },
});

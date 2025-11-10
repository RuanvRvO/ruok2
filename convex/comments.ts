import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new comment
export const createComment = mutation({
  args: {
    postId: v.id("posts"),
    userId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.content.trim()) {
      throw new Error("Comment content is required");
    }

    // Check if post exists
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    const commentId = await ctx.db.insert("comments", {
      postId: args.postId,
      userId: args.userId,
      content: args.content,
      createdAt: Date.now(),
    });

    return {
      success: true,
      commentId,
      message: "Comment created successfully",
    };
  },
});

// Get comments for a post
export const getCommentsByPost = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    // Get user info for each comment
    const commentsWithUsers = await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        return {
          ...comment,
          author: user
            ? { name: user.name, email: user.email, avatar: user.avatar }
            : null,
        };
      })
    );

    return commentsWithUsers;
  },
});

// Get comments by user
export const getCommentsByUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return comments;
  },
});

// Delete a comment
export const deleteComment = mutation({
  args: {
    commentId: v.id("comments"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);

    if (!comment) {
      throw new Error("Comment not found");
    }

    if (comment.userId !== args.userId) {
      throw new Error("Unauthorized: You can only delete your own comments");
    }

    await ctx.db.delete(args.commentId);

    return {
      success: true,
      message: "Comment deleted successfully",
    };
  },
});

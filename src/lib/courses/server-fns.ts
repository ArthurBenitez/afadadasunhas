import { createServerFn } from "@tanstack/react-start";

// This file contains server functions for course management and auth checks
// Note: Actual data fetching will be done directly via supabase client for now 
// to ensure realtime compatibility and simplicity, while server fns will be used 
// for sensitive operations in the future.

export const placeholderFn = createServerFn({ method: "GET" })
  .handler(async () => {
    return { status: "ok" };
  });


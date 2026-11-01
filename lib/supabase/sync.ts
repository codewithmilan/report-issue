import { supabaseAdmin, isSupabaseConfigured } from "./admin";

/**
 * Synchronize a registered user to Supabase Auth and public.profiles table
 */
export async function syncUserToSupabase(user: {
  email: string;
  name: string;
  password?: string;
  phone?: string;
  role?: string;
}) {
  if (!isSupabaseConfigured()) {
    return { success: false, reason: "Supabase not configured" };
  }

  try {
    const email = user.email.toLowerCase().trim();
    let supabaseUserId: string | null = null;

    // 1. Check if user already exists in Supabase Auth
    const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (!listError && userList?.users) {
      const existing = userList.users.find((u) => u.email?.toLowerCase() === email);
      if (existing) {
        supabaseUserId = existing.id;
      }
    }

    // 2. If not found in Auth, create user in Supabase Auth
    if (!supabaseUserId) {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: user.password || "CivicReport123!",
        email_confirm: true,
        user_metadata: {
          full_name: user.name,
          phone: user.phone || "",
        },
      });

      if (createError) {
        console.warn("[Supabase Sync] Warning creating auth user:", createError.message);
      } else if (newUser?.user) {
        supabaseUserId = newUser.user.id;
      }
    }

    // 3. Upsert user into public.profiles
    if (supabaseUserId) {
      const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
        {
          id: supabaseUserId,
          full_name: user.name,
          phone: user.phone || null,
          user_type: user.role === "admin" ? "admin" : "citizen",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      if (profileError) {
        console.warn("[Supabase Sync] Warning upserting profile:", profileError.message);
      }
    }

    return { success: true, supabaseUserId };
  } catch (err: any) {
    console.error("[Supabase Sync] Exception syncing user:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Synchronize a reported civic issue to Supabase public.civic_issues table
 */
export async function syncIssueToSupabase(issue: {
  title: string;
  description: string;
  category?: string;
  userEmail?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  priority?: string;
  imageUrl?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}) {
  if (!isSupabaseConfigured()) {
    return { success: false, reason: "Supabase not configured" };
  }

  try {
    // 1. Find matching category ID from issue_categories
    let categoryId: string | null = null;
    const { data: categories } = await supabaseAdmin.from("issue_categories").select("id, name");
    if (categories && categories.length > 0) {
      const matched = categories.find(
        (c) => c.name.toLowerCase() === (issue.category || "").toLowerCase()
      );
      if (matched) {
        categoryId = matched.id;
      } else {
        const other = categories.find((c) => c.name.toLowerCase() === "other");
        if (other) categoryId = other.id;
      }
    }

    // 2. Find reporter profile ID from Supabase Auth
    let reporterId: string | null = null;
    if (issue.userEmail) {
      const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
      const user = userList?.users?.find(
        (u) => u.email?.toLowerCase() === issue.userEmail?.toLowerCase()
      );
      if (user) {
        reporterId = user.id;
      }
    }

    // Map status to valid check constraint: 'open' | 'in_progress' | 'resolved' | 'closed'
    const statusMap: Record<string, string> = {
      pending: "open",
      open: "open",
      in_progress: "in_progress",
      resolved: "resolved",
      rejected: "closed",
      closed: "closed",
    };
    const validStatus = statusMap[issue.status || "open"] || "open";

    // Map priority: 'low' | 'medium' | 'high' | 'urgent'
    const priorityMap: Record<string, string> = {
      low: "low",
      medium: "medium",
      high: "high",
      urgent: "urgent",
    };
    const validPriority = priorityMap[issue.priority || "medium"] || "medium";

    // 3. Insert into public.civic_issues
    const { data: insertedIssue, error: issueError } = await supabaseAdmin
      .from("civic_issues")
      .insert({
        title: issue.title,
        description: issue.description,
        category_id: categoryId,
        reporter_id: reporterId,
        location_address: issue.location || null,
        latitude: issue.latitude || null,
        longitude: issue.longitude || null,
        status: validStatus,
        priority: validPriority,
        image_url: issue.imageUrl || null,
        created_at: issue.createdAt ? new Date(issue.createdAt).toISOString() : new Date().toISOString(),
        updated_at: issue.updatedAt ? new Date(issue.updatedAt).toISOString() : new Date().toISOString(),
      })
      .select()
      .single();

    if (issueError) {
      console.warn("[Supabase Sync] Warning inserting civic issue:", issueError.message);
      return { success: false, error: issueError.message };
    }

    return { success: true, data: insertedIssue };
  } catch (err: any) {
    console.error("[Supabase Sync] Exception syncing issue:", err.message);
    return { success: false, error: err.message };
  }
}


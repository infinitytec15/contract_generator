import { createClient } from "../../supabase/server";

type NotificationType = {
  user_id: string;
  title: string;
  message: string;
  read?: boolean;
  link?: string;
};

export async function createNotification(notification: NotificationType) {
  const supabase = await createClient();

  const { error } = await supabase.from("notifications").insert({
    user_id: notification.user_id,
    title: notification.title,
    message: notification.message,
    read: notification.read ?? false,
    link: notification.link,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Error creating notification:", error);
  }

  return !error;
}

export async function createAdminNotifications(
  title: string,
  message: string,
  link?: string,
) {
  const supabase = await createClient();

  // Get all admin users
  const { data: adminUsers } = await supabase
    .from("user_roles")
    .select("user_id")
    .in("roles.name", ["admin", "super_admin"])
    .join("roles", { "user_roles.role_id": "roles.id" });

  if (!adminUsers || adminUsers.length === 0) {
    console.warn("No admin users found to notify");
    return false;
  }

  // Create notifications for all admins
  const notifications = adminUsers.map((admin) => ({
    user_id: admin.user_id,
    title,
    message,
    read: false,
    link,
    created_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from("notifications").insert(notifications);

  if (error) {
    console.error("Error creating admin notifications:", error);
  }

  return !error;
}

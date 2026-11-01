import mongoose, { Schema } from "mongoose";

// ==========================================
// 1. User Schema
// ==========================================
export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  role: "admin" | "user";
  phone?: string;
  avatar?: string;
  status: "active" | "inactive" | "suspended";
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    phone: { type: String, default: "" },
    avatar: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive", "suspended"], default: "active" },
    lastLogin: { type: Date, default: null },
  },
  { timestamps: true }
);

// ==========================================
// 2. Issue Schema
// ==========================================
export interface IIssue {
  _id?: string;
  title: string;
  description: string;
  category: string;
  userId: string | mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  imageUrl?: string;
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
  status: "pending" | "in_progress" | "resolved" | "rejected";
  priority: "low" | "medium" | "high" | "urgent";
  adminRemarks?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const IssueSchema = new Schema<IIssue>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    userAvatar: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    location: { type: String, default: "" },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved", "rejected"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    adminRemarks: { type: String, default: "" },
  },
  { timestamps: true }
);

// ==========================================
// 3. ActivityLog Schema
// ==========================================
export interface IActivityLog {
  _id?: string;
  userId?: string | mongoose.Types.ObjectId;
  userName?: string;
  userEmail?: string;
  action: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date;
}

export const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    userName: { type: String, default: "System" },
    userEmail: { type: String, default: "" },
    action: { type: String, required: true },
    description: { type: String, required: true },
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// Reuse or register Mongoose models
export const UserModel = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export const IssueModel = mongoose.models.Issue || mongoose.model<IIssue>("Issue", IssueSchema);
export const ActivityLogModel = mongoose.models.ActivityLog || mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);


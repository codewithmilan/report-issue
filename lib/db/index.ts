import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import {
  IUser,
  IIssue,
  IActivityLog,
  UserModel,
  IssueModel,
  ActivityLogModel,
} from "./schemas";

export interface DbState {
  users: IUser[];
  issues: IIssue[];
  activityLogs: IActivityLog[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "civic_db.json");

let isMongooseConnected = false;
let isConnectingMongoose = false;

// Generate MongoDB-like 24-char hex ObjectId string
export function generateObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, "0");
  const random = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
  return timestamp + random;
}

// Seed initial data
const SEED_USERS: IUser[] = [
  {
    _id: "6724a1b0e123456789012341",
    name: "Civic Administrator",
    email: "admin@civicreport.com",
    password: bcrypt.hashSync("admin123", 10),
    role: "admin",
    phone: "+1 (555) 019-2834",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    status: "active",
    lastLogin: new Date(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    _id: "6724a1b0e123456789012342",
    name: "Jane Citizen",
    email: "citizen@community.org",
    password: bcrypt.hashSync("citizen123", 10),
    role: "user",
    phone: "+1 (555) 432-8910",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    status: "active",
    lastLogin: new Date(),
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
];

const SEED_ISSUES: IIssue[] = [
  {
    _id: "6724a2c0e123456789012301",
    title: "Hazardous Pothole on Oak Avenue",
    description: "Deep pothole causing vehicle tire damage near the intersection of 5th and Oak Ave. Needs immediate cold asphalt patch.",
    category: "Road & Transportation",
    userId: "6724a1b0e123456789012342",
    userName: "Jane Citizen",
    userEmail: "citizen@community.org",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80",
    location: "Corner of Oak Ave & 5th St",
    latitude: 37.7749,
    longitude: -122.4194,
    status: "in_progress",
    priority: "high",
    adminRemarks: "Assigned to Public Works Road Crew #4. Repair scheduled.",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "6724a2c0e123456789012302",
    title: "Broken Streetlight outside Elm Elementary",
    description: "Streetlight fixture #42 is flickering and completely dark at night, creating a safety hazard for pedestrians and school children.",
    category: "Public Safety",
    userId: "6724a1b0e123456789012342",
    userName: "Jane Citizen",
    userEmail: "citizen@community.org",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=80",
    location: "420 Elm Street, Elementary Entrance",
    latitude: 37.7833,
    longitude: -122.4167,
    status: "pending",
    priority: "medium",
    adminRemarks: "Awaiting replacement LED lamp parts.",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "6724a2c0e123456789012303",
    title: "Water Main Leak Flooding Sidewalk",
    description: "Continuous pressurized water bubbling through sidewalk pavement crack near hydrant.",
    category: "Water & Utilities",
    userId: "6724a1b0e123456789012342",
    userName: "Jane Citizen",
    userEmail: "citizen@community.org",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1584463699027-2c97486e92ba?w=600&auto=format&fit=crop&q=80",
    location: "782 Pine Blvd",
    latitude: 37.7689,
    longitude: -122.4432,
    status: "resolved",
    priority: "urgent",
    adminRemarks: "Valve shut off and pipe repaired by Water Bureau on Sunday.",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
];

const SEED_LOGS: IActivityLog[] = [
  {
    _id: "6724a3c0e123456789012391",
    userId: "6724a1b0e123456789012341",
    userName: "Civic Administrator",
    userEmail: "admin@civicreport.com",
    action: "LOGIN_SUCCESS",
    description: "Administrator signed in securely",
    ipAddress: "127.0.0.1",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    createdAt: new Date(),
  },
  {
    _id: "6724a3c0e123456789012392",
    userId: "6724a1b0e123456789012342",
    userName: "Jane Citizen",
    userEmail: "citizen@community.org",
    action: "ISSUE_CREATE",
    description: "Reported new civic issue: Hazardous Pothole on Oak Avenue",
    ipAddress: "127.0.0.1",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
];

// Helper to read JSON DB
function readDbFile(): DbState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial: DbState = {
        users: SEED_USERS,
        issues: SEED_ISSUES,
        activityLogs: SEED_LOGS,
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const data = JSON.parse(raw);
    return {
      users: data.users || [],
      issues: data.issues || [],
      activityLogs: data.activityLogs || [],
    };
  } catch (err) {
    console.error("Failed to read DB file, using in-memory defaults:", err);
    return {
      users: [...SEED_USERS],
      issues: [...SEED_ISSUES],
      activityLogs: [...SEED_LOGS],
    };
  }
}

// Helper to write JSON DB
function writeDbFile(state: DbState): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write to DB file:", err);
  }
}

// Memory cache of DB for fast queries
let dbMemory: DbState | null = null;

function getDb(): DbState {
  if (!dbMemory) {
    dbMemory = readDbFile();
  }
  return dbMemory;
}

function persistDb(): void {
  if (dbMemory) {
    writeDbFile(dbMemory);
  }
}

// Attempt Mongoose connection if URI provided
export async function connectMongo(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return false;
  if (isMongooseConnected) return true;
  if (isConnectingMongoose) return false;

  try {
    isConnectingMongoose = true;
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    isMongooseConnected = true;
    console.log("Connected to MongoDB via Mongoose successfully.");
    return true;
  } catch (err) {
    console.warn("MongoDB connection not available, operating in embedded document mode:", (err as any).message);
    isMongooseConnected = false;
    return false;
  } finally {
    isConnectingMongoose = false;
  }
}

// ==========================================
// User Repository
// ==========================================
export const UserRepo = {
  async findByEmail(email: string): Promise<IUser | null> {
    const cleanEmail = email.trim().toLowerCase();
    const isMongo = await connectMongo();

    if (isMongo) {
      const user = await UserModel.findOne({ email: cleanEmail }).lean();
      if (user) return user as IUser;
    }

    const db = getDb();
    const found = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    return found ? { ...found } : null;
  },

  async findById(id: string): Promise<IUser | null> {
    const cleanId = String(id);
    const isMongo = await connectMongo();

    if (isMongo) {
      const user = await UserModel.findById(cleanId).lean();
      if (user) return user as IUser;
    }

    const db = getDb();
    const found = db.users.find((u) => String(u._id) === cleanId);
    return found ? { ...found } : null;
  },

  async create(data: {
    name: string;
    email: string;
    password: string;
    role?: "admin" | "user";
    phone?: string;
    avatar?: string;
  }): Promise<IUser> {
    const cleanEmail = data.email.trim().toLowerCase();
    const isMongo = await connectMongo();

    // Check duplicate
    const existing = await UserRepo.findByEmail(cleanEmail);
    if (existing) {
      throw new Error("A user with this email address already exists.");
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const now = new Date();

    const newUser: IUser = {
      _id: generateObjectId(),
      name: data.name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: data.role === "admin" ? "admin" : "user",
      phone: data.phone || "",
      avatar:
        data.avatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}`,
      status: "active",
      lastLogin: now,
      createdAt: now,
      updatedAt: now,
    };

    if (isMongo) {
      try {
        const created = await UserModel.create({
          ...newUser,
          _id: new mongoose.Types.ObjectId(newUser._id),
        });
        return created.toObject() as IUser;
      } catch (err) {
        console.warn("MongoDB create failed, saving to embedded store", err);
      }
    }

    const db = getDb();
    db.users.push(newUser);
    persistDb();
    return { ...newUser };
  },

  async update(id: string, updates: Partial<IUser>): Promise<IUser | null> {
    const cleanId = String(id);
    const isMongo = await connectMongo();
    updates.updatedAt = new Date();

    if (isMongo) {
      const updated = await UserModel.findByIdAndUpdate(cleanId, updates, { new: true }).lean();
      if (updated) return updated as IUser;
    }

    const db = getDb();
    const idx = db.users.findIndex((u) => String(u._id) === cleanId);
    if (idx === -1) return null;

    db.users[idx] = { ...db.users[idx], ...updates };
    persistDb();
    return { ...db.users[idx] };
  },

  async updateLastLogin(id: string): Promise<void> {
    await UserRepo.update(id, { lastLogin: new Date() });
  },

  async getAll(filter: { search?: string; status?: string; role?: string } = {}): Promise<IUser[]> {
    const isMongo = await connectMongo();

    if (isMongo) {
      const query: any = {};
      if (filter.status && filter.status !== "all") query.status = filter.status;
      if (filter.role && filter.role !== "all") query.role = filter.role;
      if (filter.search) {
        query.$or = [
          { name: { $regex: filter.search, $options: "i" } },
          { email: { $regex: filter.search, $options: "i" } },
        ];
      }
      const users = await UserModel.find(query).select("-password").sort({ createdAt: -1 }).lean();
      return users as IUser[];
    }

    const db = getDb();
    let result = db.users.map((u) => {
      const { password, ...safeUser } = u;
      return safeUser as IUser;
    });

    if (filter.status && filter.status !== "all") {
      result = result.filter((u) => u.status === filter.status);
    }
    if (filter.role && filter.role !== "all") {
      result = result.filter((u) => u.role === filter.role);
    }
    if (filter.search) {
      const s = filter.search.toLowerCase();
      result = result.filter(
        (u) => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s)
      );
    }

    return result.sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  },

  async count(filter: { status?: string; role?: string; since?: Date } = {}): Promise<number> {
    const all = await UserRepo.getAll();
    let filtered = all;
    if (filter.status) filtered = filtered.filter((u) => u.status === filter.status);
    if (filter.role) filtered = filtered.filter((u) => u.role === filter.role);
    if (filter.since) {
      filtered = filtered.filter((u) => new Date(u.createdAt || 0) >= filter.since!);
    }
    return filtered.length;
  },
};

// ==========================================
// Issue Repository
// ==========================================
export const IssueRepo = {
  async create(data: {
    title: string;
    description: string;
    category: string;
    userId: string;
    userName: string;
    userEmail: string;
    userAvatar?: string;
    imageUrl?: string;
    location?: string;
    latitude?: number | null;
    longitude?: number | null;
    priority?: "low" | "medium" | "high" | "urgent";
  }): Promise<IIssue> {
    const isMongo = await connectMongo();
    const now = new Date();

    const newIssue: IIssue = {
      _id: generateObjectId(),
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category || "General",
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      userAvatar: data.userAvatar || "",
      imageUrl: data.imageUrl || "",
      location: data.location || "",
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      status: "pending",
      priority: data.priority || "medium",
      adminRemarks: "",
      createdAt: now,
      updatedAt: now,
    };

    if (isMongo) {
      try {
        const created = await IssueModel.create({
          ...newIssue,
          _id: new mongoose.Types.ObjectId(newIssue._id),
          userId: new mongoose.Types.ObjectId(data.userId),
        });
        return created.toObject() as IIssue;
      } catch (err) {
        console.warn("MongoDB issue create failed, saving to embedded store", err);
      }
    }

    const db = getDb();
    db.issues.unshift(newIssue);
    persistDb();
    return { ...newIssue };
  },

  async findById(id: string): Promise<IIssue | null> {
    const cleanId = String(id);
    const isMongo = await connectMongo();

    if (isMongo) {
      const issue = await IssueModel.findById(cleanId).lean();
      if (issue) return issue as IIssue;
    }

    const db = getDb();
    const found = db.issues.find((i) => String(i._id) === cleanId);
    return found ? { ...found } : null;
  },

  async findByUserId(userId: string): Promise<IIssue[]> {
    const cleanUserId = String(userId);
    const isMongo = await connectMongo();

    if (isMongo) {
      const issues = await IssueModel.find({ userId: cleanUserId })
        .sort({ createdAt: -1 })
        .lean();
      return issues as IIssue[];
    }

    const db = getDb();
    return db.issues
      .filter((i) => String(i.userId) === cleanUserId)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  },

  async getAll(filter: {
    search?: string;
    status?: string;
    category?: string;
    priority?: string;
  } = {}): Promise<IIssue[]> {
    const isMongo = await connectMongo();

    if (isMongo) {
      const query: any = {};
      if (filter.status && filter.status !== "all") query.status = filter.status;
      if (filter.category && filter.category !== "all") query.category = filter.category;
      if (filter.priority && filter.priority !== "all") query.priority = filter.priority;
      if (filter.search) {
        query.$or = [
          { title: { $regex: filter.search, $options: "i" } },
          { description: { $regex: filter.search, $options: "i" } },
          { location: { $regex: filter.search, $options: "i" } },
        ];
      }
      const issues = await IssueModel.find(query).sort({ createdAt: -1 }).lean();
      return issues as IIssue[];
    }

    const db = getDb();
    let result = [...db.issues];

    if (filter.status && filter.status !== "all") {
      result = result.filter((i) => i.status === filter.status);
    }
    if (filter.category && filter.category !== "all") {
      result = result.filter((i) => i.category.toLowerCase() === filter.category!.toLowerCase());
    }
    if (filter.priority && filter.priority !== "all") {
      result = result.filter((i) => i.priority === filter.priority);
    }
    if (filter.search) {
      const s = filter.search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(s) ||
          i.description.toLowerCase().includes(s) ||
          (i.location && i.location.toLowerCase().includes(s))
      );
    }

    return result.sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  },

  async updateStatus(
    id: string,
    status: "pending" | "in_progress" | "resolved" | "rejected",
    adminRemarks?: string
  ): Promise<IIssue | null> {
    const cleanId = String(id);
    const isMongo = await connectMongo();
    const updates: Partial<IIssue> = {
      status,
      updatedAt: new Date(),
    };
    if (adminRemarks !== undefined) {
      updates.adminRemarks = adminRemarks;
    }

    if (isMongo) {
      const updated = await IssueModel.findByIdAndUpdate(cleanId, updates, { new: true }).lean();
      if (updated) return updated as IIssue;
    }

    const db = getDb();
    const idx = db.issues.findIndex((i) => String(i._id) === cleanId);
    if (idx === -1) return null;

    db.issues[idx] = { ...db.issues[idx], ...updates };
    persistDb();
    return { ...db.issues[idx] };
  },

  async getStats(): Promise<{
    total: number;
    pending: number;
    in_progress: number;
    resolved: number;
    rejected: number;
    today: number;
  }> {
    const all = await IssueRepo.getAll();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return {
      total: all.length,
      pending: all.filter((i) => i.status === "pending").length,
      in_progress: all.filter((i) => i.status === "in_progress").length,
      resolved: all.filter((i) => i.status === "resolved").length,
      rejected: all.filter((i) => i.status === "rejected").length,
      today: all.filter((i) => new Date(i.createdAt || 0) >= startOfToday).length,
    };
  },
};

// ==========================================
// Activity Log Repository
// ==========================================
export const ActivityRepo = {
  async log(data: {
    userId?: string;
    userName?: string;
    userEmail?: string;
    action: string;
    description: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<IActivityLog> {
    const isMongo = await connectMongo();
    const newLog: IActivityLog = {
      _id: generateObjectId(),
      userId: data.userId || undefined,
      userName: data.userName || "System",
      userEmail: data.userEmail || "",
      action: data.action,
      description: data.description,
      ipAddress: data.ipAddress || "127.0.0.1",
      userAgent: data.userAgent || "Browser",
      createdAt: new Date(),
    };

    if (isMongo) {
      try {
        const created = await ActivityLogModel.create({
          ...newLog,
          _id: new mongoose.Types.ObjectId(newLog._id),
          userId: data.userId ? new mongoose.Types.ObjectId(data.userId) : null,
        });
        return created.toObject() as IActivityLog;
      } catch (err) {
        console.warn("MongoDB activity log failed, saving to embedded store", err);
      }
    }

    const db = getDb();
    db.activityLogs.unshift(newLog);
    // Keep max 500 logs to prevent bloat
    if (db.activityLogs.length > 500) {
      db.activityLogs = db.activityLogs.slice(0, 500);
    }
    persistDb();
    return { ...newLog };
  },

  async getAll(filter: { userId?: string; limit?: number } = {}): Promise<IActivityLog[]> {
    const isMongo = await connectMongo();

    if (isMongo) {
      const query: any = {};
      if (filter.userId) query.userId = filter.userId;
      const logs = await ActivityLogModel.find(query)
        .sort({ createdAt: -1 })
        .limit(filter.limit || 50)
        .lean();
      return logs as IActivityLog[];
    }

    const db = getDb();
    let result = [...db.activityLogs];
    if (filter.userId) {
      result = result.filter((l) => String(l.userId) === String(filter.userId));
    }
    result.sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
    return result.slice(0, filter.limit || 50);
  },
};


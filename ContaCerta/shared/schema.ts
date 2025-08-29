import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  boolean,
  integer,
  decimal,
  timestamp,
  jsonb,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Enums
export const userRoleEnum = pgEnum("user_role", ["ENTREPRENEUR", "CONSULTANT", "ADMIN"]);
export const userStatusEnum = pgEnum("user_status", ["PENDING_VERIFICATION", "ACTIVE", "SUSPENDED", "INACTIVE"]);
export const projectStatusEnum = pgEnum("project_status", ["DRAFT", "PUBLISHED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "DISPUTED"]);
export const proposalStatusEnum = pgEnum("proposal_status", ["SENT", "VIEWED", "ACCEPTED", "DECLINED", "COUNTER_OFFERED", "EXPIRED"]);
export const paymentStatusEnum = pgEnum("payment_status", ["PENDING", "PROCESSING", "COMPLETED", "FAILED", "REFUNDED", "DISPUTED"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["PROJECT_PAYMENT", "SUBSCRIPTION", "REFUND", "COMMISSION"]);
export const subscriptionPlanEnum = pgEnum("subscription_plan", ["FREE", "ENTREPRENEUR_PRO", "CONSULTANT_EXPERT"]);
export const notificationTypeEnum = pgEnum("notification_type", ["MESSAGE", "PROPOSAL", "PROJECT_UPDATE", "PAYMENT", "SYSTEM", "MARKETING"]);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role"),
  status: userStatusEnum("status").default("PENDING_VERIFICATION"),
  phone: varchar("phone"),
  emailVerified: boolean("email_verified").default(false),
  phoneVerified: boolean("phone_verified").default(false),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  lastLogin: timestamp("last_login"),
  loginCount: integer("login_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const entrepreneurProfiles = pgTable("entrepreneur_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  companyName: text("company_name").notNull(),
  companyDescription: text("company_description"),
  industry: text("industry").notNull(),
  foundedAt: timestamp("founded_at"),
  employeeCount: integer("employee_count"),
  monthlyRevenue: decimal("monthly_revenue", { precision: 12, scale: 2 }),
  website: text("website"),
  linkedin: text("linkedin"),
  instagram: text("instagram"),
  businessStage: text("business_stage").notNull(), // "idea", "prototype", "launch", "growth"
  pitchDeckUrl: text("pitch_deck_url"),
  businessPlanUrl: text("business_plan_url"),
  country: text("country").default("Brasil").notNull(),
  state: text("state").notNull(),
  city: text("city").notNull(),
  isRemote: boolean("is_remote").default(false),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  urgencyLevel: text("urgency_level"), // "low", "medium", "high"
  consultationAreas: text("consultation_areas").array(),
  totalProjects: integer("total_projects").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
  totalSpent: decimal("total_spent", { precision: 12, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const consultantProfiles = pgTable("consultant_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  title: text("title").notNull(),
  bio: text("bio").notNull(),
  experience: integer("experience").notNull(), // years
  hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }),
  projectRate: decimal("project_rate", { precision: 10, scale: 2 }),
  education: jsonb("education").array(),
  certifications: jsonb("certifications").array(),
  languages: text("languages").array().default(["português"]),
  country: text("country").default("Brasil").notNull(),
  state: text("state").notNull(),
  city: text("city").notNull(),
  timezone: text("timezone").default("America/Sao_Paulo"),
  isRemote: boolean("is_remote").default(true),
  availability: jsonb("availability"),
  industries: text("industries").array(),
  isVerified: boolean("is_verified").default(false),
  verifiedAt: timestamp("verified_at"),
  documentsUrl: text("documents_url").array(),
  totalProjects: integer("total_projects").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
  totalEarnings: decimal("total_earnings", { precision: 12, scale: 2 }).default("0"),
  responseTime: integer("response_time"), // in hours
  profileViews: integer("profile_views").default(0),
  acceptingClients: boolean("accepting_clients").default(true),
  instantBooking: boolean("instant_booking").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const specializations = pgTable("specializations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").unique().notNull(),
  description: text("description"),
  category: text("category").notNull(),
  isActive: boolean("is_active").default(true),
});

export const portfolioItems = pgTable("portfolio_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  consultantId: varchar("consultant_id").notNull().references(() => consultantProfiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  industry: text("industry"),
  duration: text("duration"),
  results: text("results"),
  imageUrl: text("image_url"),
  caseStudyUrl: text("case_study_url"),
  clientName: text("client_name"),
  testimonial: text("testimonial"),
  tags: text("tags").array(),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entrepreneurId: varchar("entrepreneur_id").notNull().references(() => entrepreneurProfiles.id),
  consultantId: varchar("consultant_id").references(() => consultantProfiles.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements"),
  deliverables: text("deliverables").array(),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  estimatedHours: integer("estimated_hours"),
  status: projectStatusEnum("status").default("DRAFT"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  completedAt: timestamp("completed_at"),
  attachments: text("attachments").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const proposals = pgTable("proposals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  proposedRate: decimal("proposed_rate", { precision: 10, scale: 2 }).notNull(),
  estimatedHours: integer("estimated_hours"),
  deliveryDate: timestamp("delivery_date"),
  status: proposalStatusEnum("status").default("SENT"),
  parentId: varchar("parent_id").references(() => proposals.id),
  viewedAt: timestamp("viewed_at"),
  respondedAt: timestamp("responded_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  attachments: text("attachments").array(),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  parentId: varchar("parent_id").references(() => messages.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  projectId: varchar("project_id").references(() => projects.id),
  type: transactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  fee: decimal("fee", { precision: 12, scale: 2 }).default("0"),
  netAmount: decimal("net_amount", { precision: 12, scale: 2 }).notNull(),
  status: paymentStatusEnum("status").default("PENDING"),
  providerId: text("provider_id"),
  providerData: jsonb("provider_data"),
  description: text("description"),
  metadata: jsonb("metadata"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  targetId: varchar("target_id").notNull(),
  targetType: text("target_type").notNull(), // "consultant", "project"
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  entrepreneurProfile: one(entrepreneurProfiles, {
    fields: [users.id],
    references: [entrepreneurProfiles.userId],
  }),
  consultantProfile: one(consultantProfiles, {
    fields: [users.id],
    references: [consultantProfiles.userId],
  }),
  sentMessages: many(messages, { relationName: "messageSender" }),
  receivedMessages: many(messages, { relationName: "messageReceiver" }),
  sentProposals: many(proposals, { relationName: "proposalSender" }),
  receivedProposals: many(proposals, { relationName: "proposalReceiver" }),
  transactions: many(transactions),
  notifications: many(notifications),
  favorites: many(favorites),
}));

export const entrepreneurProfilesRelations = relations(entrepreneurProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [entrepreneurProfiles.userId],
    references: [users.id],
  }),
  projects: many(projects),
}));

export const consultantProfilesRelations = relations(consultantProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [consultantProfiles.userId],
    references: [users.id],
  }),
  portfolioItems: many(portfolioItems),
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  entrepreneur: one(entrepreneurProfiles, {
    fields: [projects.entrepreneurId],
    references: [entrepreneurProfiles.id],
  }),
  consultant: one(consultantProfiles, {
    fields: [projects.consultantId],
    references: [consultantProfiles.id],
  }),
  proposals: many(proposals),
  messages: many(messages),
  transactions: many(transactions),
}));

export const proposalsRelations = relations(proposals, ({ one, many }) => ({
  project: one(projects, {
    fields: [proposals.projectId],
    references: [projects.id],
  }),
  sender: one(users, {
    fields: [proposals.senderId],
    references: [users.id],
    relationName: "proposalSender",
  }),
  receiver: one(users, {
    fields: [proposals.receiverId],
    references: [users.id],
    relationName: "proposalReceiver",
  }),
  parent: one(proposals, {
    fields: [proposals.parentId],
    references: [proposals.id],
    relationName: "proposalCounters",
  }),
  counters: many(proposals, { relationName: "proposalCounters" }),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  project: one(projects, {
    fields: [messages.projectId],
    references: [projects.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "messageSender",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "messageReceiver",
  }),
  parent: one(messages, {
    fields: [messages.parentId],
    references: [messages.id],
    relationName: "messageThread",
  }),
  replies: many(messages, { relationName: "messageThread" }),
}));

export const portfolioItemsRelations = relations(portfolioItems, ({ one }) => ({
  consultant: one(consultantProfiles, {
    fields: [portfolioItems.consultantId],
    references: [consultantProfiles.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [transactions.projectId],
    references: [projects.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
}));

// Schemas for forms
export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  role: true,
});

export const insertEntrepreneurProfileSchema = createInsertSchema(entrepreneurProfiles).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  totalProjects: true,
  averageRating: true,
  totalSpent: true,
});

export const insertConsultantProfileSchema = createInsertSchema(consultantProfiles).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  totalProjects: true,
  averageRating: true,
  totalEarnings: true,
  profileViews: true,
  isVerified: true,
  verifiedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  entrepreneurId: true,
  consultantId: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

export const insertProposalSchema = createInsertSchema(proposals).omit({
  id: true,
  senderId: true,
  receiverId: true,
  createdAt: true,
  updatedAt: true,
  viewedAt: true,
  respondedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  senderId: true,
  receiverId: true,
  createdAt: true,
  updatedAt: true,
  isRead: true,
  readAt: true,
});

export const insertPortfolioItemSchema = createInsertSchema(portfolioItems).omit({
  id: true,
  consultantId: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type EntrepreneurProfile = typeof entrepreneurProfiles.$inferSelect;
export type ConsultantProfile = typeof consultantProfiles.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Proposal = typeof proposals.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type PortfolioItem = typeof portfolioItems.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;
export type Specialization = typeof specializations.$inferSelect;

export type InsertEntrepreneurProfile = z.infer<typeof insertEntrepreneurProfileSchema>;
export type InsertConsultantProfile = z.infer<typeof insertConsultantProfileSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertProposal = z.infer<typeof insertProposalSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertPortfolioItem = z.infer<typeof insertPortfolioItemSchema>;

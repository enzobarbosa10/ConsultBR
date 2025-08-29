import {
  users,
  entrepreneurProfiles,
  consultantProfiles,
  projects,
  proposals,
  messages,
  portfolioItems,
  notifications,
  specializations,
  favorites,
  type User,
  type UpsertUser,
  type EntrepreneurProfile,
  type ConsultantProfile,
  type Project,
  type Proposal,
  type Message,
  type PortfolioItem,
  type Notification,
  type Specialization,
  type Favorite,
  type InsertEntrepreneurProfile,
  type InsertConsultantProfile,
  type InsertProject,
  type InsertProposal,
  type InsertMessage,
  type InsertPortfolioItem,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, inArray, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Profile operations
  createEntrepreneurProfile(profile: InsertEntrepreneurProfile): Promise<EntrepreneurProfile>;
  createConsultantProfile(profile: InsertConsultantProfile): Promise<ConsultantProfile>;
  getEntrepreneurProfile(userId: string): Promise<EntrepreneurProfile | undefined>;
  getConsultantProfile(userId: string): Promise<ConsultantProfile | undefined>;
  updateEntrepreneurProfile(userId: string, updates: Partial<InsertEntrepreneurProfile>): Promise<EntrepreneurProfile | undefined>;
  updateConsultantProfile(userId: string, updates: Partial<InsertConsultantProfile>): Promise<ConsultantProfile | undefined>;
  
  // Project operations
  createProject(entrepreneurId: string, project: InsertProject): Promise<Project>;
  getProject(id: string): Promise<Project | undefined>;
  getProjectsByEntrepreneur(entrepreneurId: string): Promise<Project[]>;
  getProjectsByConsultant(consultantId: string): Promise<Project[]>;
  getPublishedProjects(limit?: number, offset?: number): Promise<Project[]>;
  updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined>;
  
  // Proposal operations
  createProposal(senderId: string, receiverId: string, proposal: InsertProposal): Promise<Proposal>;
  getProposal(id: string): Promise<Proposal | undefined>;
  getProposalsByProject(projectId: string): Promise<Proposal[]>;
  getProposalsByUser(userId: string, type: 'sent' | 'received'): Promise<Proposal[]>;
  updateProposal(id: string, updates: Partial<InsertProposal>): Promise<Proposal | undefined>;
  
  // Message operations
  createMessage(senderId: string, receiverId: string, message: InsertMessage): Promise<Message>;
  getMessagesBetweenUsers(user1Id: string, user2Id: string, projectId?: string): Promise<Message[]>;
  getConversations(userId: string): Promise<any[]>;
  markMessageAsRead(messageId: string): Promise<void>;
  
  // Consultant operations
  getConsultants(filters?: any, limit?: number, offset?: number): Promise<any[]>;
  getConsultantWithProfile(userId: string): Promise<any>;
  
  // Portfolio operations
  createPortfolioItem(consultantId: string, item: InsertPortfolioItem): Promise<PortfolioItem>;
  getPortfolioItems(consultantId: string): Promise<PortfolioItem[]>;
  
  // Specializations
  getSpecializations(): Promise<Specialization[]>;
  
  // Favorites
  addFavorite(userId: string, targetId: string, targetType: string): Promise<Favorite>;
  removeFavorite(userId: string, targetId: string, targetType: string): Promise<void>;
  getUserFavorites(userId: string, targetType?: string): Promise<Favorite[]>;
  
  // Dashboard stats
  getEntrepreneurStats(entrepreneurId: string): Promise<any>;
  getConsultantStats(consultantId: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Profile operations
  async createEntrepreneurProfile(profile: InsertEntrepreneurProfile): Promise<EntrepreneurProfile> {
    const [entrepreneurProfile] = await db
      .insert(entrepreneurProfiles)
      .values(profile)
      .returning();
    return entrepreneurProfile;
  }

  async createConsultantProfile(profile: InsertConsultantProfile): Promise<ConsultantProfile> {
    const [consultantProfile] = await db
      .insert(consultantProfiles)
      .values(profile)
      .returning();
    return consultantProfile;
  }

  async getEntrepreneurProfile(userId: string): Promise<EntrepreneurProfile | undefined> {
    const [profile] = await db
      .select()
      .from(entrepreneurProfiles)
      .where(eq(entrepreneurProfiles.userId, userId));
    return profile;
  }

  async getConsultantProfile(userId: string): Promise<ConsultantProfile | undefined> {
    const [profile] = await db
      .select()
      .from(consultantProfiles)
      .where(eq(consultantProfiles.userId, userId));
    return profile;
  }

  async updateEntrepreneurProfile(userId: string, updates: Partial<InsertEntrepreneurProfile>): Promise<EntrepreneurProfile | undefined> {
    const [profile] = await db
      .update(entrepreneurProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(entrepreneurProfiles.userId, userId))
      .returning();
    return profile;
  }

  async updateConsultantProfile(userId: string, updates: Partial<InsertConsultantProfile>): Promise<ConsultantProfile | undefined> {
    const [profile] = await db
      .update(consultantProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(consultantProfiles.userId, userId))
      .returning();
    return profile;
  }

  // Project operations
  async createProject(entrepreneurId: string, project: InsertProject): Promise<Project> {
    const [newProject] = await db
      .insert(projects)
      .values({ ...project, entrepreneurId })
      .returning();
    return newProject;
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));
    return project;
  }

  async getProjectsByEntrepreneur(entrepreneurId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.entrepreneurId, entrepreneurId))
      .orderBy(desc(projects.createdAt));
  }

  async getProjectsByConsultant(consultantId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.consultantId, consultantId))
      .orderBy(desc(projects.createdAt));
  }

  async getPublishedProjects(limit = 20, offset = 0): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.status, "PUBLISHED"))
      .orderBy(desc(projects.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  // Proposal operations
  async createProposal(senderId: string, receiverId: string, proposal: InsertProposal): Promise<Proposal> {
    const [newProposal] = await db
      .insert(proposals)
      .values({ ...proposal, senderId, receiverId })
      .returning();
    return newProposal;
  }

  async getProposal(id: string): Promise<Proposal | undefined> {
    const [proposal] = await db
      .select()
      .from(proposals)
      .where(eq(proposals.id, id));
    return proposal;
  }

  async getProposalsByProject(projectId: string): Promise<Proposal[]> {
    return await db
      .select()
      .from(proposals)
      .where(eq(proposals.projectId, projectId))
      .orderBy(desc(proposals.createdAt));
  }

  async getProposalsByUser(userId: string, type: 'sent' | 'received'): Promise<Proposal[]> {
    const field = type === 'sent' ? proposals.senderId : proposals.receiverId;
    return await db
      .select()
      .from(proposals)
      .where(eq(field, userId))
      .orderBy(desc(proposals.createdAt));
  }

  async updateProposal(id: string, updates: Partial<InsertProposal>): Promise<Proposal | undefined> {
    const [proposal] = await db
      .update(proposals)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(proposals.id, id))
      .returning();
    return proposal;
  }

  // Message operations
  async createMessage(senderId: string, receiverId: string, message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values({ ...message, senderId, receiverId })
      .returning();
    return newMessage;
  }

  async getMessagesBetweenUsers(user1Id: string, user2Id: string, projectId?: string): Promise<Message[]> {
    let query = db
      .select()
      .from(messages)
      .where(
        and(
          or(
            and(eq(messages.senderId, user1Id), eq(messages.receiverId, user2Id)),
            and(eq(messages.senderId, user2Id), eq(messages.receiverId, user1Id))
          ),
          projectId ? eq(messages.projectId, projectId) : sql`true`
        )
      )
      .orderBy(messages.createdAt);

    return await query;
  }

  async getConversations(userId: string): Promise<any[]> {
    // Get latest message from each conversation
    const conversations = await db
      .select({
        id: messages.id,
        content: messages.content,
        createdAt: messages.createdAt,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        projectId: messages.projectId,
        isRead: messages.isRead,
      })
      .from(messages)
      .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
      .orderBy(desc(messages.createdAt));

    // Group by conversation partner and project
    const grouped = new Map();
    
    for (const message of conversations) {
      const partnerId = message.senderId === userId ? message.receiverId : message.senderId;
      const key = `${partnerId}-${message.projectId || 'general'}`;
      
      if (!grouped.has(key)) {
        grouped.set(key, {
          partnerId,
          projectId: message.projectId,
          lastMessage: message,
          unreadCount: message.senderId !== userId && !message.isRead ? 1 : 0,
        });
      } else if (message.senderId !== userId && !message.isRead) {
        grouped.get(key).unreadCount++;
      }
    }

    return Array.from(grouped.values());
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(messages.id, messageId));
  }

  // Consultant operations
  async getConsultants(filters: any = {}, limit = 20, offset = 0): Promise<any[]> {
    let query = db
      .select({
        id: consultantProfiles.id,
        userId: consultantProfiles.userId,
        title: consultantProfiles.title,
        bio: consultantProfiles.bio,
        experience: consultantProfiles.experience,
        hourlyRate: consultantProfiles.hourlyRate,
        averageRating: consultantProfiles.averageRating,
        totalProjects: consultantProfiles.totalProjects,
        city: consultantProfiles.city,
        state: consultantProfiles.state,
        industries: consultantProfiles.industries,
        responseTime: consultantProfiles.responseTime,
        acceptingClients: consultantProfiles.acceptingClients,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
      })
      .from(consultantProfiles)
      .innerJoin(users, eq(consultantProfiles.userId, users.id))
      .where(eq(consultantProfiles.acceptingClients, true))
      .orderBy(desc(consultantProfiles.averageRating))
      .limit(limit)
      .offset(offset);

    if (filters.specialization) {
      query = query.where(
        sql`${consultantProfiles.industries} @> ARRAY[${filters.specialization}]`
      );
    }

    if (filters.search) {
      query = query.where(
        or(
          ilike(consultantProfiles.title, `%${filters.search}%`),
          ilike(consultantProfiles.bio, `%${filters.search}%`),
          ilike(users.firstName, `%${filters.search}%`),
          ilike(users.lastName, `%${filters.search}%`)
        )
      );
    }

    return await query;
  }

  async getConsultantWithProfile(userId: string): Promise<any> {
    const [consultant] = await db
      .select({
        id: consultantProfiles.id,
        userId: consultantProfiles.userId,
        title: consultantProfiles.title,
        bio: consultantProfiles.bio,
        experience: consultantProfiles.experience,
        hourlyRate: consultantProfiles.hourlyRate,
        projectRate: consultantProfiles.projectRate,
        education: consultantProfiles.education,
        certifications: consultantProfiles.certifications,
        languages: consultantProfiles.languages,
        city: consultantProfiles.city,
        state: consultantProfiles.state,
        country: consultantProfiles.country,
        industries: consultantProfiles.industries,
        averageRating: consultantProfiles.averageRating,
        totalProjects: consultantProfiles.totalProjects,
        responseTime: consultantProfiles.responseTime,
        acceptingClients: consultantProfiles.acceptingClients,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        email: users.email,
      })
      .from(consultantProfiles)
      .innerJoin(users, eq(consultantProfiles.userId, users.id))
      .where(eq(consultantProfiles.userId, userId));

    return consultant;
  }

  // Portfolio operations
  async createPortfolioItem(consultantId: string, item: InsertPortfolioItem): Promise<PortfolioItem> {
    const [portfolioItem] = await db
      .insert(portfolioItems)
      .values({ ...item, consultantId })
      .returning();
    return portfolioItem;
  }

  async getPortfolioItems(consultantId: string): Promise<PortfolioItem[]> {
    return await db
      .select()
      .from(portfolioItems)
      .where(and(
        eq(portfolioItems.consultantId, consultantId),
        eq(portfolioItems.isPublic, true)
      ))
      .orderBy(desc(portfolioItems.createdAt));
  }

  // Specializations
  async getSpecializations(): Promise<Specialization[]> {
    return await db
      .select()
      .from(specializations)
      .where(eq(specializations.isActive, true))
      .orderBy(specializations.name);
  }

  // Favorites
  async addFavorite(userId: string, targetId: string, targetType: string): Promise<Favorite> {
    const [favorite] = await db
      .insert(favorites)
      .values({ userId, targetId, targetType })
      .returning();
    return favorite;
  }

  async removeFavorite(userId: string, targetId: string, targetType: string): Promise<void> {
    await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.targetId, targetId),
          eq(favorites.targetType, targetType)
        )
      );
  }

  async getUserFavorites(userId: string, targetType?: string): Promise<Favorite[]> {
    let query = db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, userId));

    if (targetType) {
      query = query.where(eq(favorites.targetType, targetType));
    }

    return await query.orderBy(desc(favorites.createdAt));
  }

  // Dashboard stats
  async getEntrepreneurStats(entrepreneurId: string): Promise<any> {
    const activeProjects = await db
      .select({ count: sql`count(*)` })
      .from(projects)
      .where(
        and(
          eq(projects.entrepreneurId, entrepreneurId),
          inArray(projects.status, ["PUBLISHED", "IN_PROGRESS"])
        )
      );

    const totalProposals = await db
      .select({ count: sql`count(*)` })
      .from(proposals)
      .innerJoin(projects, eq(proposals.projectId, projects.id))
      .where(eq(projects.entrepreneurId, entrepreneurId));

    const favoriteConsultants = await db
      .select({ count: sql`count(*)` })
      .from(favorites)
      .innerJoin(entrepreneurProfiles, eq(favorites.userId, entrepreneurProfiles.userId))
      .where(
        and(
          eq(entrepreneurProfiles.id, entrepreneurId),
          eq(favorites.targetType, "consultant")
        )
      );

    return {
      activeProjects: Number(activeProjects[0]?.count || 0),
      totalProposals: Number(totalProposals[0]?.count || 0),
      favoriteConsultants: Number(favoriteConsultants[0]?.count || 0),
    };
  }

  async getConsultantStats(consultantId: string): Promise<any> {
    const activeProjects = await db
      .select({ count: sql`count(*)` })
      .from(projects)
      .where(
        and(
          eq(projects.consultantId, consultantId),
          eq(projects.status, "IN_PROGRESS")
        )
      );

    const sentProposals = await db
      .select({ count: sql`count(*)` })
      .from(proposals)
      .innerJoin(consultantProfiles, eq(proposals.senderId, consultantProfiles.userId))
      .where(eq(consultantProfiles.id, consultantId));

    return {
      activeProjects: Number(activeProjects[0]?.count || 0),
      sentProposals: Number(sentProposals[0]?.count || 0),
    };
  }
}

export const storage = new DatabaseStorage();

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertEntrepreneurProfileSchema,
  insertConsultantProfileSchema,
  insertProjectSchema,
  insertProposalSchema,
  insertMessageSchema,
  insertPortfolioItemSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get profile data based on user role
      let profile = null;
      if (user.role === "ENTREPRENEUR") {
        profile = await storage.getEntrepreneurProfile(userId);
      } else if (user.role === "CONSULTANT") {
        profile = await storage.getConsultantProfile(userId);
      }
      
      res.json({ ...user, profile });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile routes
  app.post('/api/profiles/entrepreneur', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = insertEntrepreneurProfileSchema.parse(req.body);
      
      // Update user role
      await storage.upsertUser({ id: userId, role: "ENTREPRENEUR" });
      
      const profile = await storage.createEntrepreneurProfile({
        ...profileData,
        userId,
      });
      
      res.json(profile);
    } catch (error) {
      console.error("Error creating entrepreneur profile:", error);
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  app.post('/api/profiles/consultant', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = insertConsultantProfileSchema.parse(req.body);
      
      // Update user role
      await storage.upsertUser({ id: userId, role: "CONSULTANT" });
      
      const profile = await storage.createConsultantProfile({
        ...profileData,
        userId,
      });
      
      res.json(profile);
    } catch (error) {
      console.error("Error creating consultant profile:", error);
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  app.put('/api/profiles/entrepreneur', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = insertEntrepreneurProfileSchema.partial().parse(req.body);
      
      const profile = await storage.updateEntrepreneurProfile(userId, updates);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error updating entrepreneur profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.put('/api/profiles/consultant', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = insertConsultantProfileSchema.partial().parse(req.body);
      
      const profile = await storage.updateConsultantProfile(userId, updates);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error updating consultant profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Project routes
  app.post('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== "ENTREPRENEUR") {
        return res.status(403).json({ message: "Only entrepreneurs can create projects" });
      }
      
      const entrepreneurProfile = await storage.getEntrepreneurProfile(userId);
      if (!entrepreneurProfile) {
        return res.status(404).json({ message: "Entrepreneur profile not found" });
      }
      
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(entrepreneurProfile.id, projectData);
      
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.get('/api/projects', async (req, res) => {
    try {
      const { limit = "20", offset = "0" } = req.query;
      const projects = await storage.getPublishedProjects(
        parseInt(limit as string),
        parseInt(offset as string)
      );
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get('/api/projects/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const project = await storage.getProject(id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.get('/api/my-projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      let projects = [];
      
      if (user?.role === "ENTREPRENEUR") {
        const profile = await storage.getEntrepreneurProfile(userId);
        if (profile) {
          projects = await storage.getProjectsByEntrepreneur(profile.id);
        }
      } else if (user?.role === "CONSULTANT") {
        const profile = await storage.getConsultantProfile(userId);
        if (profile) {
          projects = await storage.getProjectsByConsultant(profile.id);
        }
      }
      
      res.json(projects);
    } catch (error) {
      console.error("Error fetching user projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.put('/api/projects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = insertProjectSchema.partial().parse(req.body);
      
      const project = await storage.updateProject(id, updates);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  // Proposal routes
  app.post('/api/proposals', isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user.claims.sub;
      const proposalData = insertProposalSchema.parse(req.body);
      
      // Get project to find receiver
      const project = await storage.getProject(proposalData.projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Find entrepreneur profile to get user ID
      const entrepreneurProfile = await storage.getEntrepreneurProfile(project.entrepreneurId);
      if (!entrepreneurProfile) {
        return res.status(404).json({ message: "Entrepreneur not found" });
      }
      
      const proposal = await storage.createProposal(
        senderId,
        entrepreneurProfile.userId,
        proposalData
      );
      
      res.json(proposal);
    } catch (error) {
      console.error("Error creating proposal:", error);
      res.status(500).json({ message: "Failed to create proposal" });
    }
  });

  app.get('/api/proposals/project/:projectId', async (req, res) => {
    try {
      const { projectId } = req.params;
      const proposals = await storage.getProposalsByProject(projectId);
      res.json(proposals);
    } catch (error) {
      console.error("Error fetching proposals:", error);
      res.status(500).json({ message: "Failed to fetch proposals" });
    }
  });

  app.get('/api/my-proposals/:type', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type } = req.params;
      
      if (type !== 'sent' && type !== 'received') {
        return res.status(400).json({ message: "Type must be 'sent' or 'received'" });
      }
      
      const proposals = await storage.getProposalsByUser(userId, type);
      res.json(proposals);
    } catch (error) {
      console.error("Error fetching user proposals:", error);
      res.status(500).json({ message: "Failed to fetch proposals" });
    }
  });

  app.put('/api/proposals/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = insertProposalSchema.partial().parse(req.body);
      
      const proposal = await storage.updateProposal(id, updates);
      
      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }
      
      res.json(proposal);
    } catch (error) {
      console.error("Error updating proposal:", error);
      res.status(500).json({ message: "Failed to update proposal" });
    }
  });

  // Consultant routes
  app.get('/api/consultants', async (req, res) => {
    try {
      const { specialization, search, limit = "20", offset = "0" } = req.query;
      
      const filters = {
        specialization: specialization as string,
        search: search as string,
      };
      
      const consultants = await storage.getConsultants(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );
      
      res.json(consultants);
    } catch (error) {
      console.error("Error fetching consultants:", error);
      res.status(500).json({ message: "Failed to fetch consultants" });
    }
  });

  app.get('/api/consultants/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const consultant = await storage.getConsultantWithProfile(userId);
      
      if (!consultant) {
        return res.status(404).json({ message: "Consultant not found" });
      }
      
      res.json(consultant);
    } catch (error) {
      console.error("Error fetching consultant:", error);
      res.status(500).json({ message: "Failed to fetch consultant" });
    }
  });

  // Portfolio routes
  app.post('/api/portfolio', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== "CONSULTANT") {
        return res.status(403).json({ message: "Only consultants can create portfolio items" });
      }
      
      const consultantProfile = await storage.getConsultantProfile(userId);
      if (!consultantProfile) {
        return res.status(404).json({ message: "Consultant profile not found" });
      }
      
      const itemData = insertPortfolioItemSchema.parse(req.body);
      const item = await storage.createPortfolioItem(consultantProfile.id, itemData);
      
      res.json(item);
    } catch (error) {
      console.error("Error creating portfolio item:", error);
      res.status(500).json({ message: "Failed to create portfolio item" });
    }
  });

  app.get('/api/portfolio/:consultantId', async (req, res) => {
    try {
      const { consultantId } = req.params;
      const items = await storage.getPortfolioItems(consultantId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  // Message routes
  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user.claims.sub;
      const messageData = insertMessageSchema.parse(req.body);
      
      const message = await storage.createMessage(
        senderId,
        messageData.receiverId,
        messageData
      );
      
      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get('/api/messages/:partnerId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { partnerId } = req.params;
      const { projectId } = req.query;
      
      const messages = await storage.getMessagesBetweenUsers(
        userId,
        partnerId,
        projectId as string
      );
      
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Favorites routes
  app.post('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { targetId, targetType } = req.body;
      
      const favorite = await storage.addFavorite(userId, targetId, targetType);
      res.json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete('/api/favorites/:targetId/:targetType', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { targetId, targetType } = req.params;
      
      await storage.removeFavorite(userId, targetId, targetType);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  app.get('/api/my-favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type } = req.query;
      
      const favorites = await storage.getUserFavorites(userId, type as string);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      let stats = {};
      
      if (user?.role === "ENTREPRENEUR") {
        const profile = await storage.getEntrepreneurProfile(userId);
        if (profile) {
          stats = await storage.getEntrepreneurStats(profile.id);
        }
      } else if (user?.role === "CONSULTANT") {
        const profile = await storage.getConsultantProfile(userId);
        if (profile) {
          stats = await storage.getConsultantStats(profile.id);
        }
      }
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Specializations
  app.get('/api/specializations', async (req, res) => {
    try {
      const specializations = await storage.getSpecializations();
      res.json(specializations);
    } catch (error) {
      console.error("Error fetching specializations:", error);
      res.status(500).json({ message: "Failed to fetch specializations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

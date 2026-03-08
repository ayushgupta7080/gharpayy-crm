import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Agents
  app.get(api.agents.list.path, async (req, res) => {
    const agents = await storage.getAgents();
    res.json(agents);
  });

  // Leads
  app.get(api.leads.list.path, async (req, res) => {
    const leads = await storage.getLeads();
    res.json(leads);
  });

  app.get(api.leads.get.path, async (req, res) => {
    const lead = await storage.getLead(Number(req.params.id));
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json(lead);
  });

  app.post(api.leads.create.path, async (req, res) => {
    try {
      const input = api.leads.create.input.parse(req.body);
      const lead = await storage.createLead(input);
      res.status(201).json(lead);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.leads.update.path, async (req, res) => {
    try {
      const input = api.leads.update.input.parse(req.body);
      const id = Number(req.params.id);
      
      const existing = await storage.getLead(id);
      if (!existing) {
        return res.status(404).json({ message: "Lead not found" });
      }

      const updated = await storage.updateLead(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Visits
  app.get(api.visits.listByLead.path, async (req, res) => {
    const leadId = Number(req.params.leadId);
    const visits = await storage.getVisitsByLead(leadId);
    res.json(visits);
  });

  app.post(api.visits.create.path, async (req, res) => {
    try {
      const input = api.visits.create.input.parse(req.body);
      const visit = await storage.createVisit(input);
      res.status(201).json(visit);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.visits.update.path, async (req, res) => {
    try {
      const input = api.visits.update.input.parse(req.body);
      const id = Number(req.params.id);
      const updated = await storage.updateVisit(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Activities
  app.get(api.activities.listByLead.path, async (req, res) => {
    const leadId = Number(req.params.leadId);
    const activities = await storage.getActivitiesByLead(leadId);
    res.json(activities);
  });

  // Dashboard
  app.get(api.dashboard.stats.path, async (req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  // Seed DB on start
  seedDatabase().catch(console.error);

  return httpServer;
}

async function seedDatabase() {
  const existingAgents = await storage.getAgents();
  if (existingAgents.length === 0) {
    await storage.createAgent({ name: "Agent A", email: "agenta@gharpayy.com" });
    await storage.createAgent({ name: "Agent B", email: "agentb@gharpayy.com" });
    await storage.createAgent({ name: "Agent C", email: "agentc@gharpayy.com" });
  }

  const existingLeads = await storage.getLeads();
  if (existingLeads.length === 0) {
    const oneDayAndHalfAgo = new Date(Date.now() - 36 * 60 * 60 * 1000);
    
    // Some mock leads
    const l1 = await storage.createLead({
      name: "Rahul Sharma",
      phone: "9876543210",
      source: "Website",
      status: "New Lead",
    });

    const l2 = await storage.createLead({
      name: "Priya Patel",
      phone: "9876543211",
      source: "WhatsApp",
      status: "Contacted",
    });

    const l3 = await storage.createLead({
      name: "Amit Kumar",
      phone: "9876543212",
      source: "Social Media",
      status: "Requirement Collected",
    });

    // Make l2 need follow-up
    await storage.updateLead(l2.id, { lastUpdatedAt: oneDayAndHalfAgo });
    
    await storage.createVisit({
      leadId: l3.id,
      propertyName: "Koramangala PG 1",
      visitDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
      outcome: "Scheduled"
    });
  }
}
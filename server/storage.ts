import { db } from "./db";
import { eq, count } from "drizzle-orm";
import {
  agents, leads, visits, activities,
  type Agent, type InsertAgent,
  type Lead, type InsertLead, type UpdateLeadRequest,
  type Visit, type InsertVisit, type UpdateVisitRequest,
  type Activity, type InsertActivity
} from "@shared/schema";

export interface IStorage {
  getAgents(): Promise<Agent[]>;
  getAgent(id: number): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;

  getLeads(): Promise<(Lead & { agent?: Agent })[]>;
  getLead(id: number): Promise<(Lead & { agent?: Agent }) | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: UpdateLeadRequest): Promise<Lead>;

  getVisitsByLead(leadId: number): Promise<Visit[]>;
  createVisit(visit: InsertVisit): Promise<Visit>;
  updateVisit(id: number, visit: UpdateVisitRequest): Promise<Visit>;

  getActivitiesByLead(leadId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  getDashboardStats(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getAgents(): Promise<Agent[]> {
    return await db.select().from(agents);
  }

  async getAgent(id: number): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent;
  }

  async createAgent(agent: InsertAgent): Promise<Agent> {
    const [created] = await db.insert(agents).values(agent).returning();
    return created;
  }

  async getLeads(): Promise<(Lead & { agent?: Agent })[]> {
    const allLeads = await db.select().from(leads);
    const allAgents = await this.getAgents();
    return allLeads.map(lead => ({
      ...lead,
      agent: lead.agentId ? allAgents.find(a => a.id === lead.agentId) : undefined
    }));
  }

  async getLead(id: number): Promise<(Lead & { agent?: Agent }) | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    if (!lead) return undefined;
    const agent = lead.agentId ? await this.getAgent(lead.agentId) : undefined;
    return { ...lead, agent };
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    // Basic round-robin agent assignment if agentId is not provided
    let agentId = lead.agentId;
    if (!agentId) {
      const allAgents = await this.getAgents();
      if (allAgents.length > 0) {
        const leadCountResult = await db.select({ count: count() }).from(leads);
        const leadCount = leadCountResult[0].count;
        agentId = allAgents[leadCount % allAgents.length].id;
      }
    }

    const [created] = await db.insert(leads).values({ ...lead, agentId }).returning();
    
    await this.createActivity({
      leadId: created.id,
      action: "Lead Created"
    });

    return created;
  }

  async updateLead(id: number, updates: UpdateLeadRequest): Promise<Lead> {
    const [updated] = await db.update(leads)
      .set({ ...updates, lastUpdatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
      
    if (updates.status) {
      await this.createActivity({
        leadId: id,
        action: `Status updated to ${updates.status}`
      });
    }

    return updated;
  }

  async getVisitsByLead(leadId: number): Promise<Visit[]> {
    return await db.select().from(visits).where(eq(visits.leadId, leadId));
  }

  async createVisit(visit: InsertVisit): Promise<Visit> {
    const [created] = await db.insert(visits).values(visit).returning();
    
    await this.createActivity({
      leadId: visit.leadId,
      action: `Visit scheduled for ${visit.propertyName} on ${new Date(visit.visitDate).toLocaleString()}`
    });

    return created;
  }

  async updateVisit(id: number, updates: UpdateVisitRequest): Promise<Visit> {
    const [updated] = await db.update(visits)
      .set(updates)
      .where(eq(visits.id, id))
      .returning();
      
    if (updates.outcome) {
      await this.createActivity({
        leadId: updated.leadId,
        action: `Visit outcome updated to ${updates.outcome} for ${updated.propertyName}`
      });
    }

    return updated;
  }

  async getActivitiesByLead(leadId: number): Promise<Activity[]> {
    return await db.select().from(activities).where(eq(activities.leadId, leadId));
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [created] = await db.insert(activities).values(activity).returning();
    return created;
  }

  async getDashboardStats() {
    const allLeads = await db.select().from(leads);
    const allVisits = await db.select().from(visits);
    const allAgents = await this.getAgents();
    
    const totalLeads = allLeads.length;
    
    const leadsByStage = allLeads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const visitsScheduled = allVisits.filter(v => v.outcome === "Scheduled").length;
    const bookingsConfirmed = allLeads.filter(l => l.status === "Booked").length;

    // Leads needing follow up (no update in 24 hours and not Booked/Lost)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const needsFollowUp = allLeads
      .filter(l => 
        l.lastUpdatedAt && 
        new Date(l.lastUpdatedAt) < twentyFourHoursAgo && 
        !['Booked', 'Lost'].includes(l.status)
      )
      .map(lead => ({
        ...lead,
        agent: lead.agentId ? allAgents.find(a => a.id === lead.agentId) : undefined
      }));

    return {
      totalLeads,
      leadsByStage,
      visitsScheduled,
      bookingsConfirmed,
      needsFollowUp
    };
  }
}

export const storage = new DatabaseStorage();
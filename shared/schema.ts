import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  source: text("source").notNull(), // Website, WhatsApp, Social Media, Phone, Form
  status: text("status").notNull().default("New Lead"), // New Lead, Contacted, Requirement Collected, Property Suggested, Visit Scheduled, Visit Completed, Booked, Lost
  agentId: integer("agent_id").references(() => agents.id),
  createdAt: timestamp("created_at").defaultNow(),
  lastUpdatedAt: timestamp("last_updated_at").defaultNow(),
});

export const visits = pgTable("visits", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id).notNull(),
  propertyName: text("property_name").notNull(),
  visitDate: timestamp("visit_date").notNull(),
  outcome: text("outcome").notNull().default("Scheduled"), // Scheduled, Completed, Rescheduled, Cancelled, Booked
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id).notNull(),
  action: text("action").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leadsRelations = relations(leads, ({ one, many }) => ({
  agent: one(agents, {
    fields: [leads.agentId],
    references: [agents.id],
  }),
  visits: many(visits),
  activities: many(activities),
}));

export const visitsRelations = relations(visits, ({ one }) => ({
  lead: one(leads, {
    fields: [visits.leadId],
    references: [leads.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  lead: one(leads, {
    fields: [activities.leadId],
    references: [leads.id],
  }),
}));

export const insertAgentSchema = createInsertSchema(agents);
export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true, lastUpdatedAt: true });
export const insertVisitSchema = createInsertSchema(visits).omit({ id: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, createdAt: true });

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;

export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;

export type Visit = typeof visits.$inferSelect;
export type InsertVisit = z.infer<typeof insertVisitSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type CreateLeadRequest = InsertLead;
export type UpdateLeadRequest = Partial<InsertLead>;
export type CreateVisitRequest = z.infer<typeof insertVisitSchema>;
export type UpdateVisitRequest = Partial<InsertVisit>;

export type LeadResponse = Lead & { agent?: Agent };
export type AgentResponse = Agent;
export type VisitResponse = Visit;
export type ActivityResponse = Activity;

export type DashboardStats = {
  totalLeads: number;
  leadsByStage: Record<string, number>;
  visitsScheduled: number;
  bookingsConfirmed: number;
};
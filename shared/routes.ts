import { z } from 'zod';
import { insertLeadSchema, insertVisitSchema, leads, visits, agents, activities } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
};

export const api = {
  agents: {
    list: {
      method: 'GET' as const,
      path: '/api/agents' as const,
      responses: {
        200: z.array(z.custom<typeof agents.$inferSelect>()),
      }
    }
  },
  leads: {
    list: {
      method: 'GET' as const,
      path: '/api/leads' as const,
      responses: {
        200: z.array(z.custom<typeof leads.$inferSelect & { agent?: typeof agents.$inferSelect }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/leads/:id' as const,
      responses: {
        200: z.custom<typeof leads.$inferSelect & { agent?: typeof agents.$inferSelect }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/leads' as const,
      input: insertLeadSchema,
      responses: {
        201: z.custom<typeof leads.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/leads/:id' as const,
      input: insertLeadSchema.partial(),
      responses: {
        200: z.custom<typeof leads.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },
  visits: {
    listByLead: {
      method: 'GET' as const,
      path: '/api/leads/:leadId/visits' as const,
      responses: {
        200: z.array(z.custom<typeof visits.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/visits' as const,
      input: insertVisitSchema.extend({
        visitDate: z.coerce.date()
      }),
      responses: {
        201: z.custom<typeof visits.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/visits/:id' as const,
      input: insertVisitSchema.partial().extend({
        visitDate: z.coerce.date().optional()
      }),
      responses: {
        200: z.custom<typeof visits.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    }
  },
  activities: {
    listByLead: {
      method: 'GET' as const,
      path: '/api/leads/:leadId/activities' as const,
      responses: {
        200: z.array(z.custom<typeof activities.$inferSelect>()),
      },
    }
  },
  dashboard: {
    stats: {
      method: 'GET' as const,
      path: '/api/dashboard/stats' as const,
      responses: {
        200: z.object({
          totalLeads: z.number(),
          leadsByStage: z.record(z.number()),
          visitsScheduled: z.number(),
          bookingsConfirmed: z.number(),
          needsFollowUp: z.array(z.custom<typeof leads.$inferSelect>())
        }),
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type LeadInput = z.infer<typeof api.leads.create.input>;
export type VisitInput = z.infer<typeof api.visits.create.input>;
export type DashboardStatsResponse = z.infer<typeof api.dashboard.stats.responses[200]>;
import { z } from 'zod';

export const companySchema = z.object({
  name: z.string().min(2),
  description: z.string().max(1000).optional().or(z.literal('')),
  industry: z.string().max(100).optional().or(z.literal('')),
  widgetName: z.string().min(2),
  systemPrompt: z.string().max(4000).optional().or(z.literal('')),
  primaryColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/),
  bubbleStyle: z.enum(['round', 'square']),
});

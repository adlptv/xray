import { z } from 'zod';

export const analyzeFileSchema = z.object({
  file: z.any().optional(),
  url: z.string().url().optional(),
}).refine((data) => data.file || data.url, {
  message: 'Either file or url must be provided',
});

export const analyzeUrlSchema = z.object({
  url: z.string().url().refine(
    (url) => url.includes('chromewebstore.google.com') || url.includes('chrome.google.com/webstore'),
    { message: 'URL must be from Chrome Web Store' }
  ),
});

export const scanResultSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  overallGrade: z.string(),
  extensionName: z.string().nullable().optional(),
  version: z.string().nullable().optional(),
  manifestVersion: z.number().nullable().optional(),
  createdAt: z.string().or(z.date()),
});

export const permissionSchema = z.object({
  name: z.string(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  grade: z.string(),
  description: z.string(),
  warnings: z.array(z.string()),
});

export const networkCallSchema = z.object({
  url: z.string(),
  method: z.string(),
  domain: z.string(),
  risk: z.enum(['low', 'medium', 'high', 'critical']),
  flags: z.array(z.string()),
});

export const compareSchema = z.object({
  id1: z.string().min(1),
  id2: z.string().min(1),
}).refine((data) => data.id1 !== data.id2, {
  message: 'Cannot compare an extension with itself',
});

export const orgPolicySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  blockedPermissions: z.array(z.string()),
  minGrade: z.enum(['A', 'B', 'C', 'D', 'E', 'F']),
  notifyOnFail: z.boolean().default(true),
});

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sort: z.enum(['newest', 'oldest', 'grade']).default('newest'),
});

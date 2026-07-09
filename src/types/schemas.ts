// Zod schemas — shared between server and client
// Design Ref: §10.4 Convention (Zod for validation)

import { z } from 'zod';

export const accountTypeSchema = z.enum([
  'teacher',
  'student',
  'school',
  'school_staff',
  'general',
]);

export const schoolLevelSchema = z.enum(['elementary', 'middle', 'high']);

export const updateProfileSchema = z.object({
  accountType: accountTypeSchema.optional(),
});

export const schoolProfileSchema = z.object({
  schoolName: z.string().min(1, '학교명은 필수입니다').max(100),
  homepageUrl: z.string().url('올바른 URL이 아닙니다').optional().or(z.literal('')),
  logoUrl: z.string().url().nullable().optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, '#RRGGBB 형식이어야 합니다')
    .nullable()
    .optional(),
  mascotDesc: z.string().max(500).nullable().optional(),
  mascotRefUrl: z.string().url().nullable().optional(),
  buildingRefUrl: z.string().url().nullable().optional(),
  styleDesc: z.string().max(500).nullable().optional(),
  basePrompt: z.string().max(1000).nullable().optional(),
  schoolLevel: schoolLevelSchema.nullable().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type SchoolProfileInput = z.infer<typeof schoolProfileSchema>;

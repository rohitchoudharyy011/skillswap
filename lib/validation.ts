import { z } from 'zod';

const SKILL_PATTERN = /^[a-z0-9][a-z0-9 +#./-]*$/;

export function normalizeSkill(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

const skillTag = z
  .string()
  .transform(normalizeSkill)
  .pipe(
    z
      .string()
      .min(2, 'Each skill needs at least 2 characters.')
      .max(40, 'Skills must be 40 characters or fewer.')
      .regex(SKILL_PATTERN, 'Skills can only use letters, numbers, spaces, and + # . / -.'),
  );

const skillList = z
  .array(skillTag)
  .max(15, 'You can add up to 15 skills per list.')
  .transform((skills) => Array.from(new Set(skills)));

const nameField = z
  .string()
  .trim()
  .min(2, 'Name needs at least 2 characters.')
  .max(60, 'Name must be 60 characters or fewer.');

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .email('Enter a valid email address.')
  .max(254, 'Email must be 254 characters or fewer.');

const passwordField = z
  .string()
  .min(8, 'Password needs at least 8 characters.')
  .max(72, 'Password must be 72 characters or fewer.');

export const signUpSchema = z.object({
  name: nameField,
  email: emailField,
  password: passwordField,
});

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Enter your password.'),
});

export const profileSchema = z.object({
  name: nameField,
  bio: z.string().trim().max(500, 'Bio must be 500 characters or fewer.'),
  location: z.string().trim().max(80, 'Location must be 80 characters or fewer.'),
  skills_offered: skillList,
  skills_wanted: skillList,
});

export const swapRequestSchema = z.object({
  recipient_id: z.string().uuid('Choose a valid member.'),
  offered_skill: skillTag,
  wanted_skill: skillTag,
  message: z.string().trim().max(500, 'Message must be 500 characters or fewer.'),
});

export const messageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty.')
    .max(2000, 'Messages must be 2000 characters or fewer.'),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Choose a rating from 1 to 5.').max(5, 'Choose a rating from 1 to 5.'),
  comment: z.string().trim().max(500, 'Comment must be 500 characters or fewer.'),
});

export function collectFieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

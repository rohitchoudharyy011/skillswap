export const SKILL_CATEGORIES = ['Tech', 'Design', 'Languages', 'Music', 'Business', 'Life & Home'] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export const SKILL_CATALOG: Record<SkillCategory, string[]> = {
  Tech: ['python', 'javascript', 'web development', 'data analysis', 'excel', 'sql', 'machine learning', 'mobile app development', 'cybersecurity', 'linux administration'],
  Design: ['graphic design', 'ui/ux design', 'photography', 'video editing', 'illustration', 'branding', 'motion graphics'],
  Languages: ['spanish', 'french', 'german', 'japanese', 'mandarin', 'english conversation', 'hindi'],
  Music: ['guitar', 'piano', 'singing', 'music production', 'drums', 'songwriting'],
  Business: ['digital marketing', 'copywriting', 'bookkeeping', 'public speaking', 'resume writing', 'financial planning', 'sales'],
  'Life & Home': ['cooking', 'baking', 'yoga', 'fitness training', 'gardening', 'woodworking', 'sewing', 'home organization'],
};

export const ALL_SKILLS = SKILL_CATEGORIES.flatMap((category) => SKILL_CATALOG[category]);

export function skillsInCategory(category: SkillCategory): string[] {
  return SKILL_CATALOG[category];
}

export function categoryOfSkill(skill: string): SkillCategory | null {
  return SKILL_CATEGORIES.find((category) => SKILL_CATALOG[category].includes(skill)) ?? null;
}

export function intersectSkills(a: string[], b: string[]): string[] {
  const bSet = new Set(b);
  return a.filter((skill) => bSet.has(skill));
}

export type SkillCategoryEnum =
  | 'PROGRAMMING'
  | 'LANGUAGE'
  | 'DESIGN'
  | 'SOFT_SKILLS'
  | 'MUSIC'
  | 'SPORTS'
  | 'BUSINESS'
  | 'OTHER';

export interface UserSkill {
  id: string;
  userId?: string;
  skillName: string;
  category: SkillCategoryEnum;
  isStrong: boolean;
  addedAt?: string;
}

export interface AddSkillDto {
  skillName: string;
  category: SkillCategoryEnum;
  isStrong: boolean;
}

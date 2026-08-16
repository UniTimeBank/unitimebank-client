export type SkillCategoryEnum =
  | 'PROGRAMMING'
  | 'LANGUAGE'
  | 'DESIGN'
  | 'ACADEMIC'
  | 'BUSINESS'
  | 'SOFT_SKILLS'
  | 'MUSIC'
  | 'SPORTS'
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

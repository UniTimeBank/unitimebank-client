import type { SkillCategoryEnum } from './user-skill.type.ts';


export interface SkillCategory {
  id: string;
  name: SkillCategoryEnum;
  isActive: boolean;
  displayOrder: number;
  labelVi?: string;
  labelEn?: string;
}

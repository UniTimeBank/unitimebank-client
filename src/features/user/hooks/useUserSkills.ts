import {
  useGetMySkillsQuery,
  useAddSkillMutation,
  useDeleteSkillMutation,
  useGetSkillCategoriesQuery,
} from '@/core/api/user';
import type { AddSkillDto } from '../types';

export const useUserSkills = () => {
  const { data: skillsData, isLoading: isLoadingSkills } = useGetMySkillsQuery();
  const { data: categoriesData, isLoading: isLoadingCategories } = useGetSkillCategoriesQuery();
  const [addSkillMutation, { isLoading: isAdding }] = useAddSkillMutation();
  const [deleteSkillMutation, { isLoading: isDeleting }] = useDeleteSkillMutation();

  const addSkill = async (dto: AddSkillDto) => {
    try {
      const res = await addSkillMutation(dto).unwrap();
      return { success: true, data: res };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const deleteSkill = async (skillId: string) => {
    try {
      const res = await deleteSkillMutation(skillId).unwrap();
      return { success: true, data: res };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  return {
    skills: skillsData?.skills || [],
    categories: categoriesData?.categories || [],
    isLoadingSkills,
    isLoadingCategories,
    addSkill,
    isAdding,
    deleteSkill,
    isDeleting,
  };
};

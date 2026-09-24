import type { MentorPost, LearnerRequest, ExploreCardItem } from '../types';
import { SKILL_CATEGORY_LABELS } from '../constants';

/**
 * Adapter chuẩn hóa MentorPost thành ExploreCardItem
 */
export const mapMentorPostToCardItem = (post: MentorPost): ExploreCardItem => {
  const cat = post.tags?.[0]?.category || 'PROGRAMMING';
  const categoryLabel = (SKILL_CATEGORY_LABELS[cat.toUpperCase()] || cat).toUpperCase();
  const allSkills = post.tags?.map((t) => t.skillName).filter(Boolean) || [];
  const totalSlots = post.availableSlots?.length || 0;
  const rateText = totalSlots > 0 ? `${totalSlots} khung giờ` : 'Lịch mở';

  return {
    id: post._id,
    type: 'MENTOR',
    title: post.title,
    description: post.shortDescription || post.description || '',
    category: cat,
    coverImage: post.coverImage,
    tagSkill: categoryLabel,
    secondaryTag: allSkills.join(', '),
    authorId: post.mentorId,
    authorName: post.mentorName || 'Mentor UniTime',
    authorAvatar: post.mentorAvatar,
    authorUniversity: 'Mentor UniTime',
    rateCreditText: rateText,
    trustScore: post.trustScoreSnapshot || 100,
    sessionType: post.sessionType || 'BOTH',
    scheduleType: post.scheduleType || 'ALWAYS_OPEN',
    detailUrl: `/posts/mentor/${post._id}`,
    createdAt: post.createdAt,
    allSkills,
  };
};

/**
 * Adapter chuẩn hóa LearnerRequest thành ExploreCardItem
 */
export const mapLearnerRequestToCardItem = (req: LearnerRequest): ExploreCardItem => {
  const cat = req.category || 'PROGRAMMING';
  const categoryLabel = (SKILL_CATEGORY_LABELS[cat.toUpperCase()] || cat).toUpperCase();
  const rawSkills = req.skillNeeded
    ? req.skillNeeded.split(/[,;/]+/).map((s) => s.trim()).filter(Boolean)
    : [];

  return {
    id: req._id,
    type: 'LEARNER',
    title: req.skillNeeded,
    description: req.shortDescription || req.description || '',
    category: cat,
    coverImage: req.coverImage,
    tagSkill: categoryLabel,
    secondaryTag: rawSkills.join(', '),
    allSkills: rawSkills.length > 0 ? rawSkills : [req.skillNeeded || 'Học tập'],
    authorId: req.learnerId,
    authorName: req.learnerName || 'Học viên UniTime',
    authorAvatar: req.learnerAvatar,
    authorUniversity: 'Sinh viên UniTime',
    rateCreditText: `${req.expectedCreditAmount || req.expectedDurationMinutes || 60} credit`,
    trustScore: 100,
    sessionType: req.sessionType || 'ONE_ON_ONE',
    detailUrl: `/posts/learner/${req._id}`,
    createdAt: req.createdAt,
  };
};

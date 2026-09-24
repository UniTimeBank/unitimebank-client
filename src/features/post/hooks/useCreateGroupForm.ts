import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateGroupMutation } from '@/core/api/community/communityApi';
import {
  CREATE_GROUP_CATEGORIES,
  PRESET_GROUP_COVERS,
  DEFAULT_GROUP_RULES,
} from '@/features/post/constants';
import { ROUTES } from '@/routes/paths';
import { toast } from 'react-hot-toast';

export const useCreateGroupForm = () => {
  const navigate = useNavigate();
  const [createGroup, { isLoading }] = useCreateGroupMutation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>(CREATE_GROUP_CATEGORIES[0]);
  const [coverUrl, setCoverUrl] = useState(PRESET_GROUP_COVERS[0].url);
  const [customCover, setCustomCover] = useState('');
  const [rules, setRules] = useState<string[]>([...DEFAULT_GROUP_RULES]);
  const [newRule, setNewRule] = useState('');

  const activeCover = customCover.trim() || coverUrl;

  const handleAddRule = () => {
    if (newRule.trim()) {
      setRules([...rules, newRule.trim()]);
      setNewRule('');
    }
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên nhóm học tập!');
      return;
    }
    if (!description.trim()) {
      toast.error('Vui lòng nhập mô tả cho nhóm!');
      return;
    }

    try {
      const created = await createGroup({
        name: name.trim(),
        description: description.trim(),
        category,
        coverUrl: activeCover,
        rules: rules.filter((r) => r.trim().length > 0),
        isPublic: true,
      }).unwrap();

      toast.success('Tạo nhóm học tập thành công!');
      if (created?._id) {
        navigate(`/community/${created._id}`);
      } else {
        navigate(ROUTES.COMMUNITY);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Có lỗi xảy ra khi tạo nhóm. Vui lòng thử lại!');
    }
  };

  const categoryOptions = CREATE_GROUP_CATEGORIES.map((cat) => ({
    value: cat,
    label: cat,
  }));

  return {
    name,
    setName,
    description,
    setDescription,
    category,
    setCategory,
    categoryOptions,
    coverUrl,
    setCoverUrl,
    customCover,
    setCustomCover,
    activeCover,
    rules,
    newRule,
    setNewRule,
    handleAddRule,
    handleRemoveRule,
    handleSubmit,
    isLoading,
  };
};

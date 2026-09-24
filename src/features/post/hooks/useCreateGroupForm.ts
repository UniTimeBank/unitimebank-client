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

// Regex kiểm tra tên nhóm hợp lệ: Chứa chữ cái tiếng Việt/quốc tế, số, khoảng trắng và các ký tự an toàn
const VALID_GROUP_NAME_REGEX = /^[\p{L}\p{N}\s\-_&,./()#+]+$/u;
const HAS_ALPHANUMERIC_REGEX = /[\p{L}\p{N}]/u;

export const useCreateGroupForm = () => {
  const navigate = useNavigate();
  const [createGroup, { isLoading }] = useCreateGroupMutation();

  const [name, setNameState] = useState('');
  const [description, setDescriptionState] = useState('');
  const [category, setCategoryState] = useState<string>(CREATE_GROUP_CATEGORIES[0]);
  const [coverUrl, setCoverUrl] = useState(PRESET_GROUP_COVERS[0].url);
  const [customCover, setCustomCover] = useState('');
  const [rules, setRules] = useState<string[]>([...DEFAULT_GROUP_RULES]);
  const [newRule, setNewRule] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeCover = customCover.trim() || coverUrl;

  const setName = (val: string) => {
    setNameState(val);
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: '' }));
    }
  };

  const setDescription = (val: string) => {
    setDescriptionState(val);
    if (errors.description) {
      setErrors((prev) => ({ ...prev, description: '' }));
    }
  };

  const setCategory = (val: string) => {
    setCategoryState(val);
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const trimmedName = name.trim();
    const trimmedDesc = description.trim();

    // 1. Kiểm tra Tên nhóm
    if (!trimmedName) {
      newErrors.name = 'Vui lòng nhập tên nhóm học tập';
    } else if (trimmedName.length < 5) {
      newErrors.name = 'Tên nhóm phải có ít nhất 5 ký tự';
    } else if (trimmedName.length > 80) {
      newErrors.name = 'Tên nhóm không được vượt quá 80 ký tự';
    } else if (!HAS_ALPHANUMERIC_REGEX.test(trimmedName)) {
      newErrors.name = 'Tên nhóm phải chứa ít nhất một chữ cái hoặc chữ số';
    } else if (!VALID_GROUP_NAME_REGEX.test(trimmedName)) {
      newErrors.name = 'Tên nhóm không được chứa các ký tự đặc biệt ngoài (- _ & , . / () # +)';
    }

    // 2. Kiểm tra Danh mục / Chuyên ngành
    if (!category || !category.trim()) {
      newErrors.category = 'Vui lòng chọn lĩnh vực hoặc chuyên ngành cho nhóm';
    }

    // 3. Kiểm tra Mô tả mục tiêu nhóm
    if (!trimmedDesc) {
      newErrors.description = 'Vui lòng nhập mô tả mục tiêu nhóm';
    } else if (trimmedDesc.length < 15) {
      newErrors.description = 'Mô tả nhóm phải có ít nhất 15 ký tự để thành viên nắm rõ mục tiêu';
    } else if (trimmedDesc.length > 1000) {
      newErrors.description = 'Mô tả nhóm không được vượt quá 1000 ký tự';
    } else if (!HAS_ALPHANUMERIC_REGEX.test(trimmedDesc)) {
      newErrors.description = 'Mô tả nhóm phải có nội dung văn bản rõ ràng';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError);
      return false;
    }

    return true;
  };

  const handleAddRule = () => {
    const trimmedRule = newRule.trim();
    if (!trimmedRule) {
      toast.error('Vui lòng nhập nội dung quy tắc');
      return;
    }
    if (trimmedRule.length < 5) {
      toast.error('Quy tắc phải có ít nhất 5 ký tự');
      return;
    }
    if (trimmedRule.length > 200) {
      toast.error('Quy tắc không được vượt quá 200 ký tự');
      return;
    }
    if (rules.some((r) => r.toLowerCase() === trimmedRule.toLowerCase())) {
      toast.error('Quy tắc này đã có trong danh sách');
      return;
    }
    if (rules.length >= 10) {
      toast.error('Nhóm chỉ nên có tối đa 10 quy tắc chính');
      return;
    }

    setRules([...rules, trimmedRule]);
    setNewRule('');
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
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

      toast.success('Khởi tạo nhóm học tập thành công!');
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
    errors,
  };
};

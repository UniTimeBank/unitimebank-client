import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui';
import { useCreateGroupForm } from '@/features/post/hooks';
import {
  CreateGroupHeaderBanner,
  CreateGroupBasicInfoCard,
  CreateGroupCoverCard,
  CreateGroupRulesCard,
  CreateGroupPreviewSidebar,
} from '@/features/post/components/community';
import { ROUTES } from '@/routes/paths';

export const CreateGroupPage: React.FC = () => {
  const {
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
  } = useCreateGroupForm();

  return (
    <div className="space-y-6 pb-16">
      {/* Back Link */}
      <div>
        <Link
          to={ROUTES.COMMUNITY}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Khám phá nhóm</span>
        </Link>
      </div>

      {/* Header Banner */}
      <CreateGroupHeaderBanner />

      {/* Main Grid: Form + Sidebar Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT / MAIN COLUMN: Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Section 1: Thông tin cơ bản */}
          <CreateGroupBasicInfoCard
            name={name}
            onNameChange={setName}
            category={category}
            onCategoryChange={setCategory}
            categoryOptions={categoryOptions}
            description={description}
            onDescriptionChange={setDescription}
          />

          {/* Section 2: Ảnh bìa nhóm */}
          <CreateGroupCoverCard
            coverUrl={coverUrl}
            onCoverUrlChange={setCoverUrl}
            customCover={customCover}
            onCustomCoverChange={setCustomCover}
            activeCover={activeCover}
          />

          {/* Section 3: Quy tắc cộng đồng */}
          <CreateGroupRulesCard
            rules={rules}
            newRule={newRule}
            onNewRuleChange={setNewRule}
            onAddRule={handleAddRule}
            onRemoveRule={handleRemoveRule}
          />

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link to={ROUTES.COMMUNITY}>
              <Button variant="outline" type="button">
                Hủy bỏ
              </Button>
            </Link>
            <Button variant="primary" type="submit" isLoading={isLoading}>
              Khởi tạo nhóm ngay
            </Button>
          </div>
        </form>

        {/* RIGHT COLUMN: Live Preview & Tips */}
        <CreateGroupPreviewSidebar
          name={name}
          description={description}
          category={category}
          coverUrl={activeCover}
        />
      </div>
    </div>
  );
};

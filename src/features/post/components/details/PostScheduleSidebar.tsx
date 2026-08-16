import React from 'react';
import {
  SidebarBookingCard,
  type SidebarBookingCardProps,
} from '@/features/schedule/components/SidebarBookingCard';

export type PostScheduleSidebarProps = SidebarBookingCardProps;

export const PostScheduleSidebar: React.FC<PostScheduleSidebarProps> = (props) => {
  return <SidebarBookingCard {...props} />;
};

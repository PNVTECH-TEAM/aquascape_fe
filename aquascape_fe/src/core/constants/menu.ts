export const MENU_ITEMS_KEY = {
  DASHBOARD: 'dashboard',
  MENTOR: 'mentor',
  USER: 'user',
  EXAM_SET: 'exam-set',
  COMPANY: 'company',
  COURSE: 'course',
};

import { HomeOutlined, UserOutlined } from '@ant-design/icons';

export const menuItems = [
  { key: MENU_ITEMS_KEY.DASHBOARD, labelKey: 'menu.dashboard', path: '/', icon: HomeOutlined },
  { key: MENU_ITEMS_KEY.USER, labelKey: 'menu.user', path: '/user', icon: UserOutlined },
];

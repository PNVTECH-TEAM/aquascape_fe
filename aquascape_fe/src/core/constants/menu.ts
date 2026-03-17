import { 
  DashboardOutlined, 
  UserOutlined, 
  FormatPainterOutlined, 
  MedicineBoxOutlined 
} from '@ant-design/icons';

export const MENU_ITEMS_KEY = {
  DASHBOARD: 'dashboard',
  MENTOR: 'mentor',
  USER: 'user',
  EXAM_SET: 'exam-set',
  COMPANY: 'company',
  COURSE: 'course',
};

export const menuItems = [
  {
    path: '/homePage',
    icon: DashboardOutlined,
    labelKey: 'menu.dashboard',
  },
  {
    path: '/profile',
    icon: UserOutlined,
    labelKey: 'menu.profile',
  },
  {
    path: '/fishAquarium',
    icon: FormatPainterOutlined,
    labelKey: 'menu.aquarium',
  },
  {
    path: '/fish-doctor',
    icon: MedicineBoxOutlined,
    labelKey: 'menu.fishDoctor',
  },
];

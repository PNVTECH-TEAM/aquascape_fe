import { useTranslation } from 'react-i18next';
import { useLocation, Link } from 'react-router-dom';

import { menuItems } from '@app/core/constants';

const Sidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className='w-full h-full bg-white rounded-2xl shadow-md p-4'>
      <nav className='flex flex-col w-full text-sm md:text-base'>
        {menuItems.map((item, idx) => {
          const isActive = currentPath === item.path;
          const Icon = item.icon;

          return (
            <Link
              to={item.path}
              key={idx}
              className={`flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-colors duration-200 
                ${
                  isActive
                    ? 'bg-[#fff2e8] text-[#ff7a45] font-semibold'
                    : 'text-[#5B5B5B] hover:bg-[#fff2e8] font-medium'
                }
              `}
            >
              <Icon style={{ fontSize: '20px', color: isActive ? '#ff7a45' : '#5B5B5B' }} />
              <span className='truncate'>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;

import { UserOutlined } from '@ant-design/icons';
import { Avatar, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

const ProfileAvatar: React.FC = () => {
  const { t } = useTranslation();

  const items: MenuProps['items'] = [
    {
      key: 'profile',
      label: t('PROFILE'),
    },
    {
      key: 'logout',
      label: t('LOG_OUT'),
      danger: true,
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']}>
      <a onClick={(e) => e.preventDefault()}>
        <Avatar size="large" icon={<UserOutlined />} />
      </a>
    </Dropdown>
  );
};

export default ProfileAvatar;

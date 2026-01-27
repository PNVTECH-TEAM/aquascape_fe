import { Layout } from 'antd';
import React, { useEffect, useState } from 'react';
import ProfileAvatar from './ProfileAvatar';

const Header: React.FC = () => {
const [visible] = useState(false);

  useEffect(() => {
  }, []);

  if (!visible) return null;

  return (
    <Layout.Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        background: '#fff',
        padding: '0 24px',
      }}
    >
      <ProfileAvatar />
    </Layout.Header>
  );
};

export default Header;

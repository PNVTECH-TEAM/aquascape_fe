import { Layout } from 'antd';
import { Content } from 'antd/es/layout/layout';
import React from 'react';
import { Outlet } from 'react-router-dom';

import { Header } from '../../organisms';

const ProfileLayout: React.FC = () => {
  return (
    <Layout className="profile-layout">
      <Header />
      <Content>
        <Outlet />
      </Content>
    </Layout>
  );
};

export default ProfileLayout;

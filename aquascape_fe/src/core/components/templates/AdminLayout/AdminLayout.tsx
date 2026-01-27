import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import React from "react";
import { Outlet } from "react-router-dom";

import { Header } from "../../organisms";

import "./AdminLayout.scss";

const AdminLayout: React.FC = () => {
  return (
    <Layout className="admin-layout">
      <Layout>
        <Header />
        <Content>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;

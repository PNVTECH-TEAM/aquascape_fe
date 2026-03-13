import Header from "@app/pages/Shared/components/Header";
import { MenuItem } from "@app/pages/Shared/components/MenuItem";
import React from "react";
import { Outlet } from "react-router-dom";

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-[160px]">
        <Outlet />
      </main>
      <MenuItem />
    </div>
  );
};

export default MainLayout;
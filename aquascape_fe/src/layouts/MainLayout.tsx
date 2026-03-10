import Header from "@app/pages/Shared/components/Header";
import { MenuItem } from "@app/pages/Shared/components/MenuItem";
import React from "react";
import { Outlet, useLocation } from "react-router-dom";

const MainLayout: React.FC = () => {
  const location = useLocation();

  const hideLayout = location.pathname.includes("Aquarium3D");

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden w-full relative">
      {!hideLayout && <Header />}

      <main className={`flex-1 ${!hideLayout ? "pt-[140px]" : ""}`}>
        <Outlet />
      </main>

      {!hideLayout && <MenuItem />}
    </div>
  );
};

export default MainLayout;

import Header from "@app/pages/Shared/components/Header";
import { MenuItem } from "@app/pages/Shared/components/MenuItem";
import React from "react";
import { Outlet, useLocation } from "react-router-dom";

const MainLayout: React.FC = () => {
  const location = useLocation();

  const hideHeader = ["/fish-doctor"].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      {!hideHeader && <Header />}

      <main className={`flex-1 ${hideHeader ? "" : "pt-[150px]"}`}>
        <Outlet />
      </main>

      <MenuItem />
    </div>
  );
};

export default MainLayout;

import Footer from "@app/pages/Shared/components/Footer";
import Header from "@app/pages/Shared/components/Header";
import React from "react";
import { Outlet, useLocation } from "react-router-dom";

const MainLayout: React.FC = () => {
  const location = useLocation();

  const isProfilePage = location.pathname === "/profile";

  return (
    <div className="min-h-screen flex flex-col">
      
      {!isProfilePage && <Header />}

      <main className={`flex-1 ${!isProfilePage ? "pt-[120px]" : ""}`}>
        <Outlet />
      </main>

      {!isProfilePage && <Footer />}
      
    </div>
  );
};

export default MainLayout;
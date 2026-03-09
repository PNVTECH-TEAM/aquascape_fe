import Footer from "@app/pages/Shared/components/Footer";
import Header from "@app/pages/Shared/components/Header";
import React from "react";
import { Outlet } from "react-router-dom";

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden w-full relative">
      <Header />
      <main className="flex-1 pt-[120px]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
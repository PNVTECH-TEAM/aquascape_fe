import React from "react";
import {
  BellOutlined,
  EnvironmentOutlined,
  SearchOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { avatar } from "@app/assets/images";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "@app/core/redux/features/auth/authSlice";
import { Dropdown, MenuProps } from "antd";
import "./Header.scss";

const Header: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: t("PROFILE") || "Profile",
      icon: <UserOutlined />,
      onClick: () => navigate("/profile"),
    },
    {
      key: "logout",
      label: t("LOG_OUT") || "Logout",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <header className="header-container fixed top-0 left-0 right-0 z-50 bg-gradient-to-br from-[#002f4b] via-[#005b96] to-[#00a8cc] px-5 pt-[30px] pb-[30px] mb-6 rounded-b-xl overflow-hidden">
      <div className="bubble bubble-1"></div>
      <div className="bubble bubble-2"></div>
      <div className="bubble bubble-3"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <EnvironmentOutlined className="text-white text-xl" />
            <div className="leading-tight">
              <p className="text-sm text-white opacity-90 m-0">
                Ho Chi Minh City
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="bg-transparent border-none p-0">
              <BellOutlined className="text-white text-xl" />
            </button>
            
            <Dropdown 
              menu={{ items: menuItems }} 
              placement="bottomRight" 
              trigger={['click']}
              arrow={{ pointAtCenter: true }}
            >
              <img
                src={avatar}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover border-2 border-white cursor-pointer transition-transform hover:scale-105 active:scale-95"
              />
            </Dropdown>
          </div>
        </div>

        <div className="bg-white rounded-full px-4 py-3 flex items-center shadow-lg">
          <SearchOutlined className="text-gray-400" />

          <input
            type="text"
            placeholder={t("HEADER.SEARCH_PLACEHOLDER")}
            className="ml-2 outline-none text-sm w-full"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;

import React from "react";
import {
  BellOutlined,
  EnvironmentOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { avatar } from "@app/assets/images";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-br from-[#002f4b] via-[#005b96] to-[#00a8cc] px-5 pt-[30px] pb-[30px] mb-6 rounded-b-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <EnvironmentOutlined className="text-white text-2xl" />
          <div className="leading-tight">
            <p className="text-sm text-white opacity-90 m-0">
              Ho Chi Minh City
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="bg-transparent border-none p-0">
            <BellOutlined className="text-white text-2xl" />
          </button>
          <img
            src={avatar}
            onClick={() => navigate("/profile")}
            alt="avatar"
            className="w-11 h-11 rounded-full object-cover border-2 border-white cursor-pointer"
          />
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
    </header>
  );
};

export default Header;

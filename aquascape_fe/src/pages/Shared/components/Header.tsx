import React from "react";
import {
  BellOutlined,
  EnvironmentOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { avatar } from "@app/assets/images";

const Header: React.FC = () => {
  const { t } = useTranslation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#93c5fd] px-5 pt-5 pb-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <EnvironmentOutlined className="text-black text-2xl" />
          <div className="leading-tight">
            <p className="text-sm text-black opacity-90 m-0">
              Ho Chi Minh City
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="bg-white w-11 h-11 rounded-full flex items-center justify-center shadow">
            <BellOutlined className="text-gray-700 text-xl" />
          </button>

          <img
            src={avatar}
            alt="avatar"
            className="w-11 h-11 rounded-full object-cover border-2 border-white"
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

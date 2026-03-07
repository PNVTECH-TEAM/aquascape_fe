import React from "react";
import {
  BellOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { avatar } from "@app/assets/images";
import { useTranslation } from "react-i18next";

const Header: React.FC = () => {
  const { t } = useTranslation();

  return (
    <header className="fixed top-0 left-0 w-full z-50 p-5 bg-gradient-to-b from-blue-600 to-sky-400">
      
      <div className="flex items-center justify-between mb-5 mt-5">
        <div className="flex items-start gap-3">
          <img
            src={avatar}
            alt="avatar"
            className="w-12 h-12 rounded-full border-2 border-white object-cover"
          />

          <div className="text-white leading-tight">
            <p className="font-semibold text-lg mb-0">Hanh Hio</p>
            <p className="text-sm opacity-90 mt-0">
              {t("HEADER.LOCATION")}
            </p>
          </div>
        </div>

        <button className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow">
          <BellOutlined className="text-xl text-gray-700" />
        </button>
      </div>

      <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow">
        <SearchOutlined className="text-xl text-gray-400" />

        <input
          type="text"
          placeholder={t("HEADER.SEARCH_PLACEHOLDER")}
          className="flex-1 outline-none text-gray-700 placeholder-gray-400"
        />

        <div className="w-px h-6 bg-gray-300" />

        <FilterOutlined className="text-xl text-gray-600 cursor-pointer" />
      </div>
    </header>
  );
};

export default Header;
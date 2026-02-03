import React from "react";
import {
  BellOutlined,
  SearchOutlined,
  FilterOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar } from "antd";

const Header: React.FC = () => {
  return (
    <header className="w-full p-5 bg-gradient-to-b from-blue-600 to-sky-400 ">
      {/* Top info */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-start gap-3">
          <Avatar
            size={48}
            icon={<UserOutlined />}
            className="border-2 border-white bg-gray-200"
          />

          <div className="text-white leading-tight">
            <p className="font-semibold text-lg mb-0">Hanh Hio</p>
            <p className="text-sm opacity-90 mt-0">Ho Chi Minh City</p>
          </div>
        </div>

        <button className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow">
          <BellOutlined className="text-xl text-gray-700" />
        </button>
      </div>

      {/* Search box */}
      <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow">
        <SearchOutlined className="text-xl text-gray-400" />

        <input
          type="text"
          placeholder="Search..."
          className="flex-1 outline-none text-gray-700 placeholder-gray-400"
        />

        <div className="w-px h-6 bg-gray-300" />

        <FilterOutlined className="text-xl text-gray-600 cursor-pointer" />
      </div>
    </header>
  );
};

export default Header;

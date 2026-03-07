import { avatar, design3D1, design3D2, profileInfo } from "@app/assets/images";
import React from "react";

interface DesignItem {
  id: number;
  title: string;
  status: string;
  image: string;
}

const designs: DesignItem[] = [
  {
    id: 1,
    title: "Nature Tank",
    status: "Completed",
    image: design3D1,
  },
  {
    id: 2,
    title: "Iwagumi Style",
    status: "Draft",
    image: design3D2,
  },
];

const Profile: React.FC = () => {
  return (
    <div className="max-w-md mx-auto bg-gray-100 min-h-screen flex flex-col">
      
      {/* Header */}
      <div className="relative">
        <img src={profileInfo} className="w-full h-48 object-cover" />

        <div className="absolute -bottom-10 left-6 flex items-center">
          <img
            src={avatar}
            className="w-20 h-20 rounded-full border-4 border-white"
          />

          <div className="ml-3">
            <h2 className="font-semibold text-lg text-white drop-shadow-lg">
              Hanh Hio
            </h2>
            <p className="text-gray-200 text-sm">hanh.hio@gmail.com</p>
          </div>
        </div>
      </div>

      {/* Space dưới avatar */}
      <div className="h-14"></div>

      {/* Nội dung chính */}
      <div className="flex-1 px-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-blue-600">My Designs</h3>
          <button className="text-blue-500 text-sm">Create New</button>
        </div>

        {designs.map((item) => (
          <div
            key={item.id}
            className="flex items-center bg-white rounded-xl shadow p-3 mb-4 hover:scale-105 transition"
          >
            <img
              src={item.image}
              className="w-20 h-16 object-cover rounded-lg"
            />

            <div className="ml-4 flex-1">
              <p className="font-medium">{item.title}</p>

              <span
                className={`text-xs px-2 py-1 rounded ${
                  item.status === "Completed"
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 mb-20">
        <button className="w-full bg-blue-500 text-white py-3 rounded-full hover:bg-blue-600 transition">
          Sign Out
        </button>
      </div>

    </div>
  );
};

export default Profile;
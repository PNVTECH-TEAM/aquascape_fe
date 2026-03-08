import { avatar, design3D1, design3D2, profileInfo } from "@app/assets/images";
import type { DesignItem } from "@app/core/interface";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const designs: DesignItem[] = [
  { id: 1, title: "Nature Tank", status: "Completed", image: design3D1 },
  { id: 2, title: "Iwagumi Style", status: "Draft", image: design3D2 },
  { id: 3, title: "Iwagumi Style", status: "Draft", image: design3D2 },
  { id: 4, title: "Iwagumi Style", status: "Draft", image: design3D2 },
  { id: 5, title: "Iwagumi Style", status: "Draft", image: design3D2 },
  { id: 6, title: "Iwagumi Style", status: "Draft", image: design3D2 },
];

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("Hanh Hio");
  const [email, setEmail] = useState("hanh.hio@gmail.com");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-100 h-screen flex flex-col">
      <div className="relative">
        <img src={profileInfo} className="w-full h-44 object-cover" />

        <button
          onClick={() => navigate("/homePage")}
          className="absolute top-4 left-4 bg-white/80 backdrop-blur-md p-2 rounded-full shadow hover:scale-105 transition"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="absolute -bottom-12 left-6 flex items-center">
          <img
            src={avatar}
            className="w-24 h-24 rounded-full border-4 border-white shadow-md cursor-pointer hover:opacity-80"
          />

          <div className="ml-4">
            {isEditing ? (
              <>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-transparent outline-none text-white font-semibold text-lg"
                />

                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-transparent outline-none text-black text-sm"
                />
              </>
            ) : (
              <div
                onClick={() => setIsEditing(true)}
                className="cursor-pointer"
              >
                <h2 className="font-semibold text-lg text-white drop-shadow-md">
                  {name}
                </h2>

                <p className="text-sm text-black">{email}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-16"></div>

      <div className="px-5 flex justify-between items-center mb-3">
        <h3 className="font-semibold text-blue-600 text-lg">
          {t("PROFILE.TITLE")}
        </h3>

        <button
          className="flex items-center gap-1 px-3 py-1.5 text-xs text-white rounded-full
          bg-gradient-to-r from-blue-400 to-blue-600 shadow-sm hover:scale-105 transition"
        >
          <span className="text-sm">+</span>
          {t("PROFILE.CREATE_NEW")}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 space-y-3">
        {designs.map((item) => (
          <div
            key={item.id}
            className="flex items-center bg-white rounded-xl shadow-sm p-3 hover:shadow-md transition"
          >
            <img
              src={item.image}
              className="w-20 h-16 object-cover rounded-lg"
            />

            <div className="ml-4 flex-1">
              <p className="font-semibold text-gray-700">{item.title}</p>

              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  item.status === "Completed"
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {item.status === "Completed"
                  ? t("PROFILE.STATUS.COMPLETED")
                  : t("PROFILE.STATUS.DRAFT")}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-4 bg-white shadow-inner">
        <button className="w-full flex items-center justify-center gap-2 border border-blue-500 text-blue-600 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-50 hover:scale-[1.02] transition shadow-sm">
          ⎋ {t("PROFILE.SIGN_OUT")}
        </button>
      </div>
    </div>
  );
};

export default Profile;

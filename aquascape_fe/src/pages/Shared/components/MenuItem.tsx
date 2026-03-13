import { Home, Fish, Box, Camera, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { MenuItemType } from "@app/core/interface";

const leftMenu: MenuItemType[] = [
  {
    id: "home",
    label: "Home",
    icon: <Home className="w-6 h-6" />,
    path: "/homePage",
  },
  {
    id: "create3D",
    label: "create3D",
    icon: <Box className="w-6 h-6" />,
    path: "/aquarium3d",
  },
];

const rightMenu: MenuItemType[] = [
  {
    id: "check-fish",
    label: "Check Fish",
    icon: <Fish className="w-6 h-6" />,
    path: "/fish-doctor",
  },
  {
    id: "profile",
    label: "Profile",
    icon: <User className="w-6 h-6" />,
    path: "/profile",
  },
];

export function MenuItem() {
  const navigate = useNavigate();
  const location = useLocation();

  const renderItem = (item: MenuItemType) => {
    const isActive = location.pathname === item.path;

    return (
      <button
        key={item.id}
        onClick={() => item.path && navigate(item.path)}
        className="flex flex-col items-center text-xs font-medium"
      >
        <div
          className={`transition ${
            isActive ? "text-blue-500 scale-110" : "text-gray-500"
          }`}
        >
          {item.icon}
        </div>

        <span
          className={`mt-1 transition ${
            isActive ? "text-blue-500" : "text-gray-600"
          }`}
        >
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-100 border-t shadow-sm">
      <div className="grid grid-cols-5 items-center py-3 relative">
        {renderItem(leftMenu[0])}
        {renderItem(leftMenu[1])}

        <div className="flex justify-center">
          <button
            onClick={() => navigate("/fishAquarium")}
            className="absolute left-1/2 -translate-x-1/2 -top-6"
          >
            <div className="w-14 h-14 bg-[#2563eb] rounded-full flex items-center justify-center shadow-lg border-4 border-white">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </button>
        </div>

        {renderItem(rightMenu[0])}
        {renderItem(rightMenu[1])}
      </div>
    </div>
  );
}

export default MenuItem;

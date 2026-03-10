import { useState } from "react";
import { Home, Fish, MessageCircle , Camera, User } from "lucide-react";
import { MenuItemType } from "@app/core/interface";

const leftMenu: MenuItemType[] = [
  {
    id: "home",
    label: "Home",
    icon: <Home className="w-6 h-6" />,
  },
  {
  id: "check-fish",
  label: "Check Fish",
  icon: <Fish className="w-6 h-6" />,
}
];

const rightMenu: MenuItemType[] = [
  {
    id: "chat",
    label: "Chat",
    icon: <MessageCircle  className="w-6 h-6" />,
  },
  {
    id: "profile",
    label: "Profile",
    icon: <User className="w-6 h-6" />,
  },
];

export function MenuItem() {
  const [activeId, setActiveId] = useState("profile");

  const renderItem = (item: MenuItemType) => (
    <button
      key={item.id}
      onClick={() => setActiveId(item.id)}
      className="flex flex-col items-center text-xs font-medium"
    >
      <div
        className={`${
          activeId === item.id ? "text-blue-500" : "text-gray-500"
        }`}
      >
        {item.icon}
      </div>

      <span
        className={`mt-1 ${
          activeId === item.id ? "text-blue-500" : "text-gray-600"
        }`}
      >
        {item.label}
      </span>
    </button>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-100 border-t">
      <div className="grid grid-cols-5 items-center py-3">

        {renderItem(leftMenu[0])}
        {renderItem(leftMenu[1])}

        <div className="flex justify-center">
          <button
          onClick={() => setActiveId("camera")}
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
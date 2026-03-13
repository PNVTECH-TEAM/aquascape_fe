import { MenuItem } from "../Shared/components/MenuItem";
import { videoFish1 } from "@app/assets/video";
import {
  background1,
  background2,
  background4,
} from "@app/assets/images";
import { Bot, ChevronRight, Layers, MessageCircle, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="max-w-sm mx-auto min-h-screen rounded-3xl overflow-hidden shadow-lg pb-24">
      <div className="p-4">
  <div className="relative h-48 rounded-2xl overflow-hidden shadow-xl">

    <div className="absolute inset-0 overflow-hidden">
      <div className="flex w-max h-full animate-slideLeft">
        <img src={background1} className="w-full h-full object-contain"/>
        <img src={background2} className="w-full h-full object-contain"/>
        <img src={background4} className="w-full h-full object-contain"/>

        <img src={background1} className="w-full h-full object-contain"/>
        <img src={background2} className="w-full h-full object-contain"/>
        <img src={background4} className="w-full h-full object-contain"/>
      </div>
    </div>

    <div className="relative z-10 flex items-center justify-between h-full p-6 text-white">

      <div className="max-w-[60%]">
        <h2 className="text-xl font-bold">YOUR SOLUTION,</h2>
        <h2 className="text-xl font-bold mb-3">ONE TAP AWAY!</h2>

        <button className="bg-white text-blue-700 px-4 py-2 text-sm font-semibold shadow-md hover:scale-105 transition">
          Explore
        </button>
      </div>

      <div className="relative w-28 h-28 flex items-center justify-center">
        <div className="absolute w-24 h-24 bg-black/30 blur-2xl translate-y-3"></div>

        <div className="relative w-28 h-28 bg-white p-2 shadow-2xl rotate-6 hover:rotate-3 transition">
          <video
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src={videoFish1} type="video/mp4"/>
          </video>
        </div>
      </div>

    </div>

  </div>
</div>

      <div className="px-4">
        <div className="flex justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Service Categories</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between bg-gray-100 p-4 rounded-xl">
            <div
              className="flex items-center gap-3"
              onClick={() => navigate("/aquarium3d")}
            >
              <Layers className="w-5 h-5 text-blue-500" />
              <p className="text-sm font-medium text-gray-700 m-0">Create 3D</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>

          <div className="flex items-center justify-between bg-gray-100 p-4 rounded-xl">
            <div
              className="flex items-center gap-3"
              onClick={() => navigate("/aquarium3d")}
            >
              <Search className="w-5 h-5 text-blue-500" />
              <p className="text-sm font-medium text-gray-700 m-0">
                Check Fish
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>

          <div className="flex items-center justify-between bg-gray-100 p-4 rounded-xl">
            <div
              className="flex items-center gap-3"
              onClick={() => navigate("/aquarium3d")}
            >
              <MessageCircle className="w-5 h-5 text-blue-500" />
              <p className="text-sm font-medium text-gray-700 m-0">Chat</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>

          <div className="flex items-center justify-between bg-gray-100 p-4 rounded-xl">
            <div
              className="flex items-center gap-3"
              onClick={() => navigate("/aquarium3d")}
            >
              <Bot className="w-5 h-5 text-blue-500" />
              <p className="text-sm font-medium text-gray-700 m-0">
                AI Support
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Popular Services</h3>
          <span className="text-sm text-gray-400">View all ›</span>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          <div className="min-w-[220px] bg-white rounded-2xl shadow-lg overflow-hidden">
            <img src={background1} className="h-28 w-full object-cover" />

            <div className="p-3">
              <div className="flex items-center text-xs text-gray-400 mb-1">
                <span className="text-yellow-400 mr-1">★</span>
                <span>4.5 (30 Reviews)</span>
              </div>

              <p className="text-sm font-semibold text-gray-800">
                3D Aquarium Design
              </p>

              <p className="text-xs text-gray-400">$25 - $30</p>
            </div>
          </div>

          <div className="min-w-[220px] bg-white rounded-2xl shadow-lg overflow-hidden">
            <img src={background2} className="h-28 w-full object-cover" />

            <div className="p-3">
              <div className="flex items-center text-xs text-gray-400 mb-1">
                <span className="text-yellow-400 mr-1">★</span>
                <span>4.8 (28 Reviews)</span>
              </div>

              <p className="text-sm font-semibold text-gray-800">
                3D Aquarium Design
              </p>

              <p className="text-xs text-gray-400">$35 - $50</p>
            </div>
          </div>
        </div>
      </div>

      <MenuItem />
    </div>
  );
}

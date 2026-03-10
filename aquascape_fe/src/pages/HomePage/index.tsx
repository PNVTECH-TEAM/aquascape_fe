import { MenuItem } from "../Shared/components/MenuItem";
import { videoFish1 } from "@app/assets/video";
import {
  background1,
  background2,
  background3,
  background4,
} from "@app/assets/images";
import { Bot, ChevronRight, Layers, MessageCircle, Search } from "lucide-react";

export default function HomePage() {
  return (
    <div className="max-w-sm mx-auto min-h-screen rounded-3xl overflow-hidden shadow-lg pb-24">
      <div className="p-4">
        <div className="relative h-48 text-white rounded-2xl p-6 flex items-center justify-between shadow-xl overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="flex animate-slideLeft h-full w-max">
              <img
                src={background1}
                className="w-80 h-full object-cover flex-shrink-0"
              />
              <img
                src={background2}
                className="w-80 h-full object-cover flex-shrink-0"
              />
              <img
                src={background3}
                className="w-80 h-full object-cover flex-shrink-0"
              />
              <img
                src={background4}
                className="w-80 h-full object-cover flex-shrink-0"
              />
              <img
                src={background1}
                className="w-80 h-full object-cover flex-shrink-0"
              />
              <img
                src={background2}
                className="w-80 h-full object-cover flex-shrink-0"
              />
              <img
                src={background3}
                className="w-80 h-full object-cover flex-shrink-0"
              />
              <img
                src={background4}
                className="w-80 h-full object-cover flex-shrink-0"
              />
            </div>
          </div>
          <div className="max-w-[60%] relative z-10">
            <h2 className="text-xl font-bold leading-tight">YOUR SOLUTION,</h2>

            <h2 className="text-xl font-bold leading-tight mb-3">
              ONE TAP AWAY!
            </h2>

            <button className="bg-white text-blue-700 px-4 py-2 text-sm font-semibold shadow-md hover:scale-105 transition">
              Explore
            </button>
          </div>

          <div className="relative w-32 h-32 flex items-center justify-center z-10">
            <div className="absolute w-28 h-28 bg-black/30 blur-2xl translate-y-3"></div>

            <div className="relative w-28 h-28 bg-white p-2 shadow-2xl rotate-6 hover:rotate-3 transition duration-300">
              <video
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              >
                <source src={videoFish1} type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4">
        <div className="flex justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Service Categories</h3>
          <span className="text-sm text-gray-400">View all</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between bg-gray-100 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <Layers className="w-5 h-5 text-blue-500" />
              <p className="text-sm font-medium text-gray-700 m-0">Create 3D</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>

          <div className="flex items-center justify-between bg-gray-100 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-blue-500" />
              <p className="text-sm font-medium text-gray-700 m-0">
                Check Fish
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>

          <div className="flex items-center justify-between bg-gray-100 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              <p className="text-sm font-medium text-gray-700 m-0">Chat</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>

          <div className="flex items-center justify-between bg-gray-100 p-4 rounded-xl">
            <div className="flex items-center gap-3">
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
                Home Cleaning
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

              <p className="text-sm font-semibold text-gray-800">Cooking</p>

              <p className="text-xs text-gray-400">$35 - $50</p>
            </div>
          </div>
        </div>
      </div>

      <MenuItem />
    </div>
  );
}

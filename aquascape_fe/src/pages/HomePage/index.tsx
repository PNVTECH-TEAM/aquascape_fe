import { videoFish1 } from "@app/assets/video";
import { background1, background2, background4 } from "@app/assets/images";
import { Bot, Layers, MessageCircle, Search, Star, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./HomePage.scss";

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="homepage-redesign pb-28">

      {/* Banner Section */}
      <div className="p-5">
        <div className="relative h-56 rounded-[2.5rem] overflow-hidden shadow-2xl banner-cta group">
          <div className="absolute inset-0 overflow-hidden opacity-40">
            <video className="w-full h-full object-cover" autoPlay loop muted playsInline>
              <source src={videoFish1} type="video/mp4" />
            </video>
          </div>

          <div className="relative z-10 flex flex-col justify-center h-full p-8 text-white">
            <h2 className="text-2xl font-black leading-tight mb-2 tracking-tight">
              AQUASCAPE<br />REVOLUTION
            </h2>
            <p className="text-blue-100 text-sm mb-6 max-w-[180px] font-medium opacity-90">
              One tap away from your perfect aquarium.
            </p>

            <button
              onClick={() => navigate("/aquarium3d")}
              className="bg-white text-[#0f4c81] px-6 py-2.5 rounded-2xl text-sm font-bold shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 w-max"
            >
              Explore Now
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="absolute right-[-20px] bottom-[-20px] w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Service Categories */}
      <div className="px-5 mb-8 relative overflow-hidden py-4">
        {/* Background Bubbles inside Services */}
        <div className="bubble bubble-1"></div>
        <div className="bubble bubble-2"></div>
        <div className="bubble bubble-3"></div>

        <div className="flex items-center justify-between mb-4 px-1 relative z-10">
          <h3 className="text-lg font-bold text-[#102a43]">Services</h3>
          <span className="text-xs font-bold text-[#25c2a0] uppercase tracking-wider">Top Rated</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card service-card group" onClick={() => navigate("/aquarium3d")}>
            <div className="icon-wrapper">
              <Layers className="w-6 h-6" />
            </div>
            <p>Create 3D</p>
          </div>

          <div className="glass-card service-card group" onClick={() => navigate("/fish-doctor")}>
            <div className="icon-wrapper bg-orange-50 text-orange-500">
              <Search className="w-6 h-6" />
            </div>
            <p>Check Fish</p>
          </div>

          <div className="glass-card service-card group" onClick={() => navigate("/aquarium3d")}>
            <div className="icon-wrapper bg-blue-50 text-blue-500">
              <MessageCircle className="w-6 h-6" />
            </div>
            <p>Chat AI</p>
          </div>

          <div className="glass-card service-card group" onClick={() => navigate("/aquarium3d")}>
            <div className="icon-wrapper bg-purple-50 text-purple-500">
              <Bot className="w-6 h-6" />
            </div>
            <p>AI Support</p>
          </div>
        </div>
      </div>

      {/* Popular Services Section */}
      <div className="px-5">
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-lg font-bold text-[#102a43]">Featured Designs</h3>
          <button className="text-sm font-semibold text-gray-400 hover:text-[#0f4c81] transition-colors">View all</button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-6 hide-scrollbar">
          {[
            { img: background1, name: "Amazon Rainforest", price: "$25.00", rating: "4.9", reviews: "128" },
            { img: background2, name: "Zen Minimalist", price: "$32.00", rating: "4.8", reviews: "95" },
            { img: background4, name: "Deep Sea Abyss", price: "$45.00", rating: "5.0", reviews: "210" }
          ].map((item, idx) => (
            <div key={idx} className="min-w-[240px] popular-card">
              <div className="relative h-32 overflow-hidden">
                <img src={item.img} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-[10px] font-bold text-gray-800">{item.rating}</span>
                </div>
              </div>

              <div className="p-4">
                <p className="text-sm font-bold text-[#102a43] mb-1">{item.name}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">{item.reviews} Reviews</span>
                  <span className="text-sm font-black text-[#25c2a0]">{item.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

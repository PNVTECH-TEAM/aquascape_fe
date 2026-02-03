import React from "react";
import {
  MailOutlined,
  FacebookOutlined,
} from "@ant-design/icons";

const Footer: React.FC = () => {
  return (
    <footer className="relative mt-16 text-white bg-gradient-to-b from-blue-600 to-sky-400">
      
      <div className="absolute -top-7 left-0 w-full h-7 bg-[radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.35),transparent_70%)]" />

      <div className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr_1fr] gap-8 px-8 py-10">
        
        <div>
          <h3 className="text-xl font-bold mb-2">Aqua Forest</h3>
          <p className="text-sm leading-relaxed opacity-90 max-w-xs">
            Design your dream aquarium in 3D.
            <br />
            Create, explore, and manage your underwater world — where creativity comes to life
          </p>
        </div>

        <div>
          <h4 className="text-base font-semibold mb-3">Features</h4>
          <ul className="space-y-2 text-sm opacity-90">
            <li>3D Aquarium Design</li>
            <li>Smart Fish Suggestion</li>
            <li>Interactive Fish Care</li>
            <li>Online Shop</li>
          </ul>
        </div>

        <div>
          <h4 className="text-base font-semibold mb-3">Contact</h4>
          <div className="flex gap-4">
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg transition hover:bg-white hover:text-blue-600 hover:-translate-y-0.5"
            >
              <MailOutlined />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg transition hover:bg-white hover:text-blue-600 hover:-translate-y-0.5"
            >
              <FacebookOutlined />
            </a>
          </div>
        </div>
      </div>

      <div className="text-center text-xs opacity-85 py-3 border-t border-white/30">
        © 2026 Aqua Forest. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

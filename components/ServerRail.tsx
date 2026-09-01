"use client";

import React from "react";
import { 
  Gamepad2, 
  Terminal, 
  Palette, 
  Headphones, 
  Compass, 
  Plus, 
  Flame,
  Radio
} from "lucide-react";

interface ServerRailProps {
  activeServerId: string;
  onSelectServer: (id: string) => void;
  onOpenCreateServer?: () => void;
}

export const servers = [
  { id: "home", name: "Direct Messages", icon: Flame, color: "bg-indigo-600", unread: 3 },
  { id: "gaming", name: "Gaming Hub", icon: Gamepad2, color: "bg-[#6366f1]", active: true },
  { id: "tech", name: "Tech Talk", icon: Terminal, color: "bg-emerald-600", unread: 5 },
  { id: "design", name: "Design Weekly", icon: Palette, color: "bg-amber-600" },
  { id: "music", name: "Music Lounge", icon: Headphones, color: "bg-rose-600" },
  { id: "radio", name: "Community Radio", icon: Radio, color: "bg-cyan-600" },
];

export default function ServerRail({
  activeServerId,
  onSelectServer,
  onOpenCreateServer,
}: ServerRailProps) {
  return (
    <nav className="w-[72px] h-screen fixed left-0 top-0 bg-[#13131b] flex flex-col items-center py-3 gap-2 z-30 select-none border-r border-[#1b1b23]">
      {/* Home / Direct Messages */}
      <div className="relative group flex items-center justify-center w-full">
        <div
          className={`absolute left-0 w-1 bg-white rounded-r transition-all duration-200 ${
            activeServerId === "home"
              ? "h-10"
              : "h-2 scale-0 group-hover:scale-100 group-hover:h-5"
          }`}
        />
        <button
          onClick={() => onSelectServer("home")}
          className={`w-12 h-12 flex items-center justify-center transition-all duration-200 relative group ${
            activeServerId === "home"
              ? "rounded-2xl bg-[#6366f1] text-white shadow-lg shadow-indigo-500/25"
              : "rounded-full bg-[#1f1f27] text-[#c7c4d7] hover:rounded-2xl hover:bg-[#6366f1] hover:text-white"
          }`}
          title="Direct Messages"
        >
          <Flame className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 bg-[#d97721] text-black text-[10px] font-bold px-1.5 py-0.2 rounded-full border-2 border-[#13131b]">
            3
          </span>
        </button>
      </div>

      <div className="w-8 h-[2px] bg-[#1f1f27] rounded-full my-1" />

      {/* Server List */}
      <div className="flex-1 w-full flex flex-col items-center gap-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {servers.slice(1).map((server) => {
          const Icon = server.icon;
          const isActive = activeServerId === server.id;

          return (
            <div
              key={server.id}
              className="relative group flex items-center justify-center w-full"
            >
              {/* Active pill */}
              <div
                className={`absolute left-0 w-1 bg-white rounded-r transition-all duration-200 ${
                  isActive
                    ? "h-10"
                    : "h-2 scale-0 group-hover:scale-100 group-hover:h-5"
                }`}
              />

              <button
                onClick={() => onSelectServer(server.id)}
                className={`w-12 h-12 flex items-center justify-center transition-all duration-200 relative ${
                  isActive
                    ? "rounded-2xl bg-[#6366f1] text-white shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-400/40"
                    : "rounded-full bg-[#1f1f27] text-[#c7c4d7] hover:rounded-2xl hover:bg-[#292932] hover:text-white"
                }`}
                title={server.name}
              >
                <Icon className="w-5 h-5" />
                {server.unread && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full border-2 border-[#13131b]">
                    {server.unread}
                  </span>
                )}
              </button>
            </div>
          );
        })}

        {/* Add Server Button */}
        <div className="relative group flex items-center justify-center w-full mt-1">
          <button
            onClick={onOpenCreateServer}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-[#1f1f27] text-[#6366f1] hover:rounded-2xl hover:bg-emerald-600 hover:text-white transition-all duration-200 group shadow-sm"
            title="Add a Server"
          >
            <Plus className="w-6 h-6 transition-transform group-hover:rotate-90" />
          </button>
        </div>

        {/* Explore Button */}
        <div className="relative group flex items-center justify-center w-full">
          <button
            className="w-12 h-12 flex items-center justify-center rounded-full bg-[#1f1f27] text-[#c7c4d7] hover:rounded-2xl hover:bg-[#6366f1] hover:text-white transition-all duration-200"
            title="Explore Discoverable Servers"
          >
            <Compass className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}

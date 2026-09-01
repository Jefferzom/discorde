"use client";

import React from "react";
import { Server } from "../types/streamsync";
import { Plus, Compass, MessageSquare, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface ServerRailProps {
  activeServerId: string;
  onSelectServer: (id: string) => void;
  onOpenCreateServer: () => void;
}

export const servers: Server[] = [
  {
    id: "dm",
    name: "Direct Messages",
    icon: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80",
    unreadCount: 3,
  },
  {
    id: "gaming",
    name: "StreamSync Gaming & Tech Hub",
    icon: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=120&h=120&q=80",
    unreadCount: 0,
    hasNotification: true,
  },
  {
    id: "devs",
    name: "WebRTC Developers Guild",
    icon: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=120&h=120&q=80",
    unreadCount: 12,
  },
  {
    id: "design",
    name: "Obsidian UI Design Labs",
    icon: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=120&h=120&q=80",
    unreadCount: 0,
  },
];

export default function ServerRail({
  activeServerId,
  onSelectServer,
  onOpenCreateServer,
}: ServerRailProps) {
  const { t } = useI18n();

  return (
    <nav className="w-[72px] h-screen fixed left-0 top-0 bg-[#13131b] flex flex-col items-center py-3 gap-2 z-30 select-none border-r border-[#1b1b23]">
      {/* Direct Messages / Home icon */}
      <div className="relative group flex items-center justify-center w-full">
        {/* Active pill indicator */}
        <div
          className={`absolute left-0 w-1 bg-white rounded-r-full transition-all duration-200 ${
            activeServerId === "dm"
              ? "h-10"
              : "h-2 scale-0 group-hover:scale-100 group-hover:h-5"
          }`}
        />

        <button
          onClick={() => onSelectServer("dm")}
          className={`w-12 h-12 rounded-3xl flex items-center justify-center transition-all duration-200 group-hover:rounded-2xl group-hover:bg-[#6366f1] shadow-lg ${
            activeServerId === "dm"
              ? "bg-[#6366f1] rounded-2xl text-white shadow-indigo-500/20"
              : "bg-[#1b1b23] text-[#c7c4d7] hover:text-white"
          }`}
          title={t.common.directMessages}
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      </div>

      {/* Separator */}
      <div className="w-8 h-[2px] bg-[#292932] rounded-full my-1" />

      {/* Servers list */}
      <div className="flex-1 w-full flex flex-col items-center gap-2 overflow-y-auto no-scrollbar">
        {servers
          .filter((s) => s.id !== "dm")
          .map((server) => {
            const isActive = activeServerId === server.id;

            return (
              <div
                key={server.id}
                className="relative group flex items-center justify-center w-full"
              >
                {/* Active pill indicator */}
                <div
                  className={`absolute left-0 w-1 bg-white rounded-r-full transition-all duration-200 ${
                    isActive
                      ? "h-10"
                      : "h-2 scale-0 group-hover:scale-100 group-hover:h-5"
                  }`}
                />

                <button
                  onClick={() => onSelectServer(server.id)}
                  className={`relative w-12 h-12 rounded-3xl overflow-hidden transition-all duration-200 group-hover:rounded-2xl shadow-md ${
                    isActive
                      ? "rounded-2xl ring-2 ring-[#6366f1] shadow-indigo-500/20"
                      : ""
                  }`}
                  title={server.name}
                >
                  <img
                    src={server.icon}
                    alt={server.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Unread badge */}
                  {server.unreadCount && server.unreadCount > 0 ? (
                    <span className="absolute bottom-0 right-0 bg-[#8083ff] text-[#0d0096] text-[10px] font-bold px-1.5 py-0.2 rounded-full border-2 border-[#13131b]">
                      {server.unreadCount}
                    </span>
                  ) : server.hasNotification ? (
                    <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-[#13131b]" />
                  ) : null}
                </button>
              </div>
            );
          })}

        {/* Add Server Button */}
        <div className="relative group flex items-center justify-center w-full">
          <button
            onClick={onOpenCreateServer}
            className="w-12 h-12 rounded-3xl bg-[#1b1b23] text-emerald-400 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-all duration-200 group-hover:rounded-2xl shadow-md group"
            title={t.common.addServer}
          >
            <Plus className="w-6 h-6 transition-transform duration-200 group-hover:rotate-90" />
          </button>
        </div>

        {/* Explore Public Hubs */}
        <div className="relative group flex items-center justify-center w-full">
          <button
            className="w-12 h-12 rounded-3xl bg-[#1b1b23] text-[#c7c4d7] hover:bg-[#6366f1] hover:text-white flex items-center justify-center transition-all duration-200 group-hover:rounded-2xl shadow-md"
            title={t.common.exploreServers}
          >
            <Compass className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Stitch Design System Badge */}
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6366f1]/20 to-[#8083ff]/40 flex items-center justify-center border border-[#6366f1]/40 text-[#c0c1ff] shadow-md" title="Google Stitch MCP Design System Active">
        <Sparkles className="w-5 h-5" />
      </div>
    </nav>
  );
}

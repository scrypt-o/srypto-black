"use client";

import DemoTileGrid, { type DemoTile } from "@/components/layouts/DemoTileGrid";

export default function DemoTileGridPage() {
  const tiles: DemoTile[] = [
    { id: "communications", title: "Messages", description: "Alerts and notifications", href: "/patient/comm", icon: "Bell", badge: 3, status: { text: "2 unread", tone: "info" }, accent: "indigo" },
    { id: "persinfo", title: "Profile", description: "Addresses, dependents, medical aid", href: "/patient/persinfo", icon: "User", accent: "emerald" },
    { id: "medhist", title: "Medical History", description: "Allergies, conditions, surgeries", href: "/patient/medhist", icon: "ClipboardList", accent: "blue" },
    { id: "medications", title: "Medications", description: "Active + adherence", href: "/patient/medications", icon: "Pill", accent: "amber" },
    { id: "location", title: "Find Care", description: "Nearest services + maps", href: "/patient/location", icon: "MapPin", accent: "teal" },
    { id: "rewards", title: "Rewards", description: "Earn progress", href: "/patient/rewards", icon: "Gift", badge: "New", accent: "yellow" },
  ];

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-950 p-6">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">Demo Tile Grid</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">A fresh, expressive grid that won’t affect the existing one.</p>

        <DemoTileGrid title="Quick Access" subtitle="Fresh tile look for exploration" tiles={tiles} />
      </div>
    </div>
  );
}


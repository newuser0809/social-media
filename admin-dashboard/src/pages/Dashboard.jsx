import React, { useState } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import {
  HomeIcon,
  UserIcon,
  CogIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import UserTable from "../components/UserTable";
import PostTable from "../components/PostTable";

function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);

  const linkClass = ({ isActive }) =>
    `text-base ${isActive ? "text-yellow-400 font-semibold" : "text-white"}`;

  return (
    <div className="flex h-screen overflow-hidden w-full">
      {/* Sidebar */}
      <div
        className={`bg-gray-800 text-white h-full ${
          collapsed ? "w-16" : "w-64"
        } transition-all duration-300`}
      >
        <div className="p-4 text-center font-bold text-lg">
          {!collapsed ? "Admin Panel" : "A"}
        </div>
        <ul className="space-y-1">
          <li className="p-4 hover:bg-gray-700 cursor-pointer flex items-center space-x-3">
            <HomeIcon className="h-6 w-6" />
            {!collapsed && (
              <NavLink to="/" className={linkClass}>
                Home
              </NavLink>
            )}
          </li>
          <li className="p-4 hover:bg-gray-700 cursor-pointer flex items-center space-x-3">
            <UserIcon className="h-6 w-6" />
            {!collapsed && (
              <NavLink to="/users" className={linkClass}>
                Users
              </NavLink>
            )}
          </li>
          <li className="p-4 hover:bg-gray-700 cursor-pointer flex items-center space-x-3">
            <CogIcon className="h-6 w-6" />
            {!collapsed && <span className="text-base">Settings</span>}
          </li>
          <li className="p-4 hover:bg-gray-700 cursor-pointer flex items-center space-x-3">
            <DocumentTextIcon className="h-6 w-6" />
            {!collapsed && (
              <NavLink to="/posts" className={linkClass}>
                Posts
              </NavLink>
            )}
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Header */}
        <div className="bg-red-400 px-6 py-4 flex items-center justify-between shadow">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 bg-gray-800 rounded hover:bg-gray-400 transition"
          >
            {collapsed ? "☰" : "✕"}
          </button>
          <div className="font-bold text-xl">Dashboard</div>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-6 bg-gray-50 overflow-y-auto text-black">
          <Routes>
            <Route
              path="/*"
              element={
                <div className="text-center text-2xl font-bold">
                  Welcome to the Admin Dashboard
                </div>
              }
            />
            <Route path="/users" element={<UserTable />} />
            <Route path="/posts" element={<PostTable />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

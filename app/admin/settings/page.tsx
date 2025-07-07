"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Database, Shield, Bell, Globe } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">System Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card className="bg-[#23232a] border-orange-500">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                System Name
              </label>
              <input
                type="text"
                defaultValue="Project Management System"
                className="w-full p-2 bg-[#18181b] border border-neutral-700 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Default User Role
              </label>
              <select className="w-full p-2 bg-[#18181b] border border-neutral-700 rounded text-white">
                <option value="student">Student</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="bg-[#23232a] border-orange-500">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Minimum Password Length
              </label>
              <input
                type="number"
                defaultValue="8"
                min="6"
                max="20"
                className="w-full p-2 bg-[#18181b] border border-neutral-700 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                defaultValue="30"
                min="5"
                max="480"
                className="w-full p-2 bg-[#18181b] border border-neutral-700 rounded text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Database Settings */}
        <Card className="bg-[#23232a] border-orange-500">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="w-5 h-5" />
              Database Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Backup Frequency
              </label>
              <select className="w-full p-2 bg-[#18181b] border border-neutral-700 rounded text-white">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Retention Period (days)
              </label>
              <input
                type="number"
                defaultValue="30"
                min="1"
                max="365"
                className="w-full p-2 bg-[#18181b] border border-neutral-700 rounded text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-[#23232a] border-orange-500">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400">
                Email Notifications
              </span>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-orange-500 bg-[#18181b] border-neutral-700 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400">
                Push Notifications
              </span>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-orange-500 bg-[#18181b] border-neutral-700 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400">
                SMS Notifications
              </span>
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-500 bg-[#18181b] border-neutral-700 rounded"
              />
            </div>
          </CardContent>
        </Card>

        {/* Regional Settings */}
        <Card className="bg-[#23232a] border-orange-500">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Regional Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Timezone
              </label>
              <select className="w-full p-2 bg-[#18181b] border border-neutral-700 rounded text-white">
                <option value="UTC">UTC</option>
                <option value="EST">Eastern Time</option>
                <option value="PST">Pacific Time</option>
                <option value="GMT">GMT</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Date Format
              </label>
              <select className="w-full p-2 bg-[#18181b] border border-neutral-700 rounded text-white">
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium">
          Save Settings
        </button>
      </div>
    </div>
  );
}

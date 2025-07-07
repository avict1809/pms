"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Clock, CheckCircle, XCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StudentRequestsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">My Requests</h1>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#23232a] border-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">
              Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">2</div>
            <p className="text-xs text-neutral-500">Awaiting review</p>
          </CardContent>
        </Card>

        <Card className="bg-[#23232a] border-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">
              Approved
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">8</div>
            <p className="text-xs text-neutral-500">This semester</p>
          </CardContent>
        </Card>

        <Card className="bg-[#23232a] border-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">
              Rejected
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">1</div>
            <p className="text-xs text-neutral-500">This semester</p>
          </CardContent>
        </Card>

        <Card className="bg-[#23232a] border-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">
              Total
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">11</div>
            <p className="text-xs text-neutral-500">This semester</p>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      <Card className="bg-[#23232a] border-orange-500">
        <CardHeader>
          <CardTitle className="text-white">Recent Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-[#18181b] rounded-lg border border-neutral-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">
                    Project Extension Request
                  </h3>
                  <p className="text-sm text-neutral-400">
                    Project: AI Learning Platform
                  </p>
                  <p className="text-xs text-neutral-500">
                    Submitted: Dec 10, 2024
                  </p>
                  <p className="text-sm text-neutral-300 mt-2">
                    Requesting 2-week extension due to technical challenges with
                    ML model training.
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#18181b] rounded-lg border border-neutral-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">
                    Additional Resources
                  </h3>
                  <p className="text-sm text-neutral-400">
                    Project: Health App
                  </p>
                  <p className="text-xs text-neutral-500">
                    Submitted: Dec 9, 2024
                  </p>
                  <p className="text-sm text-neutral-300 mt-2">
                    Need access to cloud computing resources for data
                    processing.
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Approved
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#18181b] rounded-lg border border-neutral-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">
                    Team Member Addition
                  </h3>
                  <p className="text-sm text-neutral-400">
                    Project: E-commerce Dashboard
                  </p>
                  <p className="text-xs text-neutral-500">
                    Submitted: Dec 8, 2024
                  </p>
                  <p className="text-sm text-neutral-300 mt-2">
                    Requesting to add Sarah Wilson to the team for frontend
                    development.
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Rejected
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#18181b] rounded-lg border border-neutral-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">
                    Software License Request
                  </h3>
                  <p className="text-sm text-neutral-400">
                    Project: AI Learning Platform
                  </p>
                  <p className="text-xs text-neutral-500">
                    Submitted: Dec 7, 2024
                  </p>
                  <p className="text-sm text-neutral-300 mt-2">
                    Need Adobe Creative Suite license for UI/UX design work.
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Approved
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

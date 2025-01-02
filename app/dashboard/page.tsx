"use client";

import { UserButton } from "@clerk/nextjs";
import React from "react";

const Dashboard = () => {
    return (
        <div className="min-h-screen bg-beige-100 text-slate-800">
            {/* Header */}
            <header className="bg-slate-600 text-white py-4 shadow-md">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold">
                        Convo<span className="text-beige-100">Vue</span>
                    </h1>
                    <UserButton />
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-10">
                {/* Dashboard Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">
                            Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-slate-600">
                            Create and manage your AI Mock Interviews
                        </p>
                    </div>
                </div>

                {/* Start New Interview Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">
                        Start a New Interview
                    </h2>
                    {/* Placeholder for AddNewInterview */}
                    <div className="border border-slate-300 p-4 rounded-lg text-center text-slate-600">
                        AddNewInterview Component Goes Here
                    </div>
                </div>

                {/* Interview List Section */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">
                        Your Interviews
                    </h2>
                    {/* Placeholder for InterviewList */}
                    <div className="border border-slate-300 p-4 rounded-lg text-center text-slate-600">
                        InterviewList Component Goes Here
                    </div>
                </div>
            </main>

            {/* Footer */}

        </div>
    );
};

export default Dashboard;

import { Outlet } from "react-router-dom";
import { SidebarNav } from "@/components/ui/sidebar";
import { BookOpen, User, Settings, LayoutDashboard } from "lucide-react";

const sidebarNavItems = [
  {
    title: "Overview",
    to: "/dashboard/overview",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    title: "Materials",
    to: "/dashboard/materials",
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    title: "Profile",
    to: "/dashboard/profile",
    icon: <User className="h-4 w-4" />,
  },
  {
    title: "Settings",
    to: "/settings",
    icon: <Settings className="h-4 w-4" />,
  },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/5">
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

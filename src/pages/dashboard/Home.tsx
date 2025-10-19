import InteractiveAvatar from "@/components/dashboard/InteractiveAvatar";
import UserStats from "@/components/dashboard/UserStats";

const DashboardHome = () => {
  return (
    <div className="p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-7xl mx-auto">
        {/* Left Side - Interactive 3D Avatar */}
        <div className="flex items-center justify-center">
          <div className="w-full relative">
            <InteractiveAvatar />
          </div>
        </div>

        {/* Right Side - User Stats */}
        <div className="flex items-center">
          <UserStats />
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;

import UserStats from "@/components/dashboard/UserStats";

const DashboardHome = () => {
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <UserStats />
      </div>
    </div>
  );
};

export default DashboardHome;

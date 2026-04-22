import React, { useEffect, useState } from "react";
import { Wallet, Gift, Zap, TrendingUp } from "lucide-react";
import { useAuthStore } from "../../store/user";
import axios from "../../lib/axios";

const RewardBalanceCard = ({ variant = "full" }) => {
  const { user, isAuthenticated } = useAuthStore();
  const [rewardData, setRewardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRewardData = async () => {
      if (!isAuthenticated || !user?._id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`/user/profile/${user._id}`);
        
        if (response.data.user) {
          const userData = response.data.user;
          setRewardData({
            totalPoints: userData.totalRewardPoints || 0,
            pointsByCanteen: userData.rewardPoints || {},
            rewardHistory: userData.rewardHistory || [],
          });
        }
      } catch (err) {
        console.error("Error fetching reward data:", err);
        setError(err.message);
        // Use demo data if fetch fails
        setRewardData({
          totalPoints: 45,
          pointsByCanteen: { "New Canteen": 25, "Juice Bar": 20 },
          rewardHistory: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRewardData();
  }, [isAuthenticated, user?._id]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const totalPoints = rewardData?.totalPoints || 0;
  const estimatedValue = (totalPoints * 0.5).toFixed(2); // Assume 1 point = 0.5 currency units

  // Compact variant (mini card)
  if (variant === "compact") {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-600 font-semibold mb-1">💰 REWARD BALANCE</p>
            <p className="text-2xl font-bold text-blue-900">{totalPoints}</p>
            <p className="text-xs text-blue-700 mt-1">Points</p>
          </div>
          <Wallet className="w-8 h-8 text-blue-500 opacity-80" />
        </div>
      </div>
    );
  }

  // Mini variant (for navbar)
  if (variant === "mini") {
    return (
      <div className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-2 rounded-full shadow-lg">
        <Gift className="w-4 h-4 text-white" />
        <span className="text-sm font-bold text-white">{totalPoints} pts</span>
      </div>
    );
  }

  // Full variant (detailed card)
  return (
    <div className="w-full max-w-md">
      {/* Main Balance Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-2xl mb-4 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-blue-300 text-sm font-semibold mb-1">STUDENT ACCOUNT</p>
              <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                <span className="text-3xl">💎</span>
                {totalPoints}
              </h2>
              <p className="text-blue-200 text-xs mt-1">Total Reward Points</p>
            </div>
            <Wallet className="w-10 h-10 text-blue-400 opacity-80" />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <p className="text-blue-300 text-xs font-semibold">Estimated Value</p>
              <p className="text-xl font-bold text-white mt-1">₹{estimatedValue}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <p className="text-blue-300 text-xs font-semibold">Account Status</p>
              <p className="text-xl font-bold text-green-400 mt-1">✓ Active</p>
            </div>
          </div>

          {/* User Info */}
          <div className="border-t border-white/20 pt-3">
            <p className="text-blue-200 text-xs">{user?.firstName} {user?.lastName}</p>
            <p className="text-blue-300 text-xs">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Canteen Breakdown */}
      {rewardData?.pointsByCanteen && Object.keys(rewardData.pointsByCanteen).length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            Points by Canteen
          </h3>
          <div className="space-y-2">
            {Object.entries(rewardData.pointsByCanteen).map(([canteen, points]) => (
              <div key={canteen} className="flex justify-between items-center bg-gradient-to-r from-orange-50 to-amber-50 p-3 rounded-lg">
                <span className="text-sm font-medium text-slate-700">{canteen}</span>
                <span className="text-sm font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                  {points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2">
          <Zap className="w-4 h-4" />
          Redeem
        </button>
        <button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2">
          <Gift className="w-4 h-4" />
          Donate
        </button>
      </div>
    </div>
  );
};

export default RewardBalanceCard;

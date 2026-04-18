import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Download, Copy, CheckCircle, Users, Calendar, Utensils, ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../../lib/axios';

const TokenGenerationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  const autoStartedPaymentRef = useRef(false);

  useEffect(() => {
    const createOrders = async () => {
      const members = location.state?.members || [];
      const eventInfo = location.state?.eventDetails || location.state?.groupInfo || null;
      
      setEventDetails(eventInfo);
      
      if (members.length === 0) {
        setTokens([]);
        setLoading(false);
        return;
      }

      try {
        const results = await Promise.all(
          members.map(async (member) => {
            const selectedMeal = member.selectedMeal || member.selectedMeals;
            
            // If we already have token from backend, use it
            if (member.token) {
              return {
                id: member.token,
                tokenNumber: member.token,
                name: member.name,
                email: member.email,
                mealSelection: selectedMeal || { name: member.meal || "Meal", price: 0 },
                paymentStatus: "pending",
                status: 'active'
              };
            }
            
            // Otherwise create new order
            const response = await axios.post("/api/orders", {
              customerName: member.name,
              canteen: "Main Canteen",
              timeSlot: "12:00 - 12:30",
              items: [
                {
                  name: selectedMeal?.name || "Meal",
                  quantity: 1,
                  price: Number(selectedMeal?.price || 0),
                },
              ],
              totalAmount: Number(selectedMeal?.price || 0),
            });

            return {
              id: `ORD-${response.data.tokenNumber}`,
              orderId: response.data.order._id,
              tokenNumber: response.data.tokenNumber,
              name: member.name,
              email: member.email,
              mealSelection: selectedMeal || { name: "Meal", price: 0 },
              paymentStatus: "pending",
              status: 'active',
              backendOrder: response.data.order,
            };
          })
        );

        setTokens(results);
      } catch (error) {
        console.error("Token generation error:", error);
        toast.error("Failed to generate order tokens.");
        
        // Fallback to mock tokens if backend fails
        const mockTokens = members.map((member, idx) => ({
          id: `TKN${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          tokenNumber: `TOKEN-${idx + 1}`,
          name: member.name,
          email: member.email,
          mealSelection: member.selectedMeal || { name: "Meal", price: 0 },
          paymentStatus: "pending",
          status: 'active'
        }));
        setTokens(mockTokens);
      } finally {
        setLoading(false);
      }
    };

    createOrders();
  }, [location.state]);

  const totalDue = tokens.reduce(
    (sum, token) => sum + Number(token.mealSelection?.price || 0),
    0
  );

  const handleCopyToken = (tokenId) => {
    navigator.clipboard.writeText(tokenId);
    setCopiedToken(tokenId);
    toast.success("Token copied to clipboard!");
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleSinglePayment = (token) => {
    if (token.orderId) {
      navigate(`/canteen/pay/${token.orderId}`, {
        state: {
          orderData: {
            _id: token.orderId,
            tokenRef: `TOKEN-${token.tokenNumber}`,
            totalAmount: Number(token.backendOrder?.totalAmount || token.mealSelection?.price || 0),
            items: (token.backendOrder?.items || []).map((item) => ({
              name: item.name,
              qty: item.quantity,
              price: item.price,
            })),
            customerName: token.name,
            customerEmail: token.email,
            source: "bulk-single",
          },
        },
      });
    } else {
      toast.success(`Payment for ${token.name} - Amount: $${token.mealSelection?.price}`);
      // Update payment status locally
      setTokens(prev => prev.map(t => 
        t.id === token.id ? { ...t, paymentStatus: 'paid' } : t
      ));
    }
  };

  const handlePayAll = () => {
    if (tokens.length === 0) return;

    const allOrderIds = tokens.filter(t => t.orderId).map(t => t.orderId);
    
    if (allOrderIds.length > 0) {
      navigate(`/canteen/pay/bulk-${Date.now()}`, {
        state: {
          orderData: {
            _id: `bulk-group-${Date.now()}`,
            tokenRef: `GROUP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            totalAmount: totalDue,
            items: tokens.map((token) => ({
              name: `${token.name} - ${token.mealSelection?.name || "Meal"}`,
              qty: 1,
              price: Number(token.mealSelection?.price || 0),
            })),
            source: "bulk-group",
            eventName: eventDetails?.name || "Bulk Event",
            orderIds: allOrderIds,
          },
        },
      });
    } else {
      toast.success(`Total Due: $${totalDue.toFixed(2)} - Process payment for all members`);
      // Update all tokens to paid
      setTokens(prev => prev.map(t => ({ ...t, paymentStatus: 'paid' })));
    }
  };

  useEffect(() => {
    if (
      loading ||
      autoStartedPaymentRef.current ||
      !location.state?.autoStartPayment ||
      tokens.length === 0
    ) {
      return;
    }

    autoStartedPaymentRef.current = true;
    handlePayAll();
  }, [loading, tokens, location.state]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadAll = () => {
    const tokenData = tokens.map(token => ({
      TokenID: token.id,
      TokenNumber: token.tokenNumber,
      MemberName: token.name,
      Email: token.email,
      Meal: token.mealSelection?.name,
      Price: token.mealSelection?.price,
      Status: token.paymentStatus,
      GeneratedAt: new Date().toISOString()
    }));
    
    const blob = new Blob([JSON.stringify(tokenData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tokens-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Tokens downloaded successfully!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50/40 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto" />
          <p className="mt-4 text-gray-600">Generating tokens...</p>
        </div>
      </div>
    );
  }

  const selectedCount = tokens.filter(t => t.paymentStatus === 'paid').length;
  const paidAmount = tokens.reduce((sum, t) => 
    t.paymentStatus === 'paid' ? sum + Number(t.mealSelection?.price || 0) : sum, 0
  );

  return (
    <div className="min-h-screen bg-orange-50/30 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
        </div>

        {/* Main Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-orange-100">
          {/* Header Section - ORANGE GRADIENT */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Individual Tokens</h1>
                <p className="text-orange-50/90">Unique tokens generated for each group member</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handlePrint} 
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
                >
                  <Download className="w-5 h-5" /> Print
                </button>
                <button 
                  onClick={handleDownloadAll}
                  className="bg-white text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50 transition flex items-center gap-2 font-semibold shadow-sm"
                >
                  <Download className="w-5 h-5" /> Download All
                </button>
              </div>
            </div>
          </div>

          {/* Event Summary */}
          <div className="bg-orange-50 border-b border-orange-100 px-6 py-4">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <span className="text-gray-700">
                    <strong>Event:</strong> {eventDetails?.name || 'Sliit Smart Canteen'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-600" />
                  <span className="text-gray-700">
                    <strong>Members:</strong> {tokens.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-orange-600" />
                  <span className="text-gray-700">
                    <strong>Total Due:</strong> Rs {totalDue.toFixed(2)}
                  </span>
                </div>
                {selectedCount > 0 && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">
                      <strong>Paid:</strong> {selectedCount}/{tokens.length} (Rs {paidAmount.toFixed(2)})
                    </span>
                  </div>
                )}
              </div>
              <button 
                onClick={handlePayAll}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition flex items-center gap-2 font-semibold shadow-md"
              >
                <CreditCard className="w-5 h-5" /> Pay All (Rs {totalDue.toFixed(2)})
              </button>
            </div>
          </div>

          {/* Tokens Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-orange-50/50 border-b border-orange-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider">#</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider">Member</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider">Meal & Price</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider">Token ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-50">
                {tokens.map((token, index) => (
                  <tr key={token.id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{token.name}</div>
                      <div className="text-xs text-gray-500">{token.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Utensils className="w-4 h-4 text-orange-400" /> 
                        {token.mealSelection?.name || "Not specified"}
                      </div>
                      <div className="text-sm font-semibold text-orange-600 mt-1">
                        Rs {Number(token.mealSelection?.price || 0).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-orange-100/50 rounded text-sm font-mono text-orange-700 border border-orange-200">
                          {token.tokenNumber || token.id}
                        </code>
                        <button
                          onClick={() => handleCopyToken(token.tokenNumber || token.id)}
                          className="text-gray-400 hover:text-orange-600 transition"
                        >
                          {copiedToken === (token.tokenNumber || token.id) ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        token.paymentStatus === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {token.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {token.paymentStatus === 'pending' ? (
                        <button 
                          onClick={() => handleSinglePayment(token)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm"
                        >
                          <CreditCard className="w-4 h-4" /> Pay Now
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm">
                          <CheckCircle className="w-4 h-4" /> Paid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Summary */}
          {tokens.length > 0 && (
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>{tokens.filter(t => t.paymentStatus === 'paid').length}</strong> of {tokens.length} payments completed
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-orange-600">Rs {totalDue.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Print Styles */}
        <style>{`
          @media print {
            body * { visibility: hidden; }
            .max-w-7xl, .max-w-7xl * { visibility: visible; }
            .max-w-7xl { position: absolute; top: 0; left: 0; width: 100%; }
            button { display: none !important; }
            .bg-gradient-to-r { 
                background: #f97316 !important; 
                -webkit-print-color-adjust: exact; 
                print-color-adjust: exact; 
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default TokenGenerationPage;
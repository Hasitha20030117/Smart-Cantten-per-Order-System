import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Download, QrCode, Copy, CheckCircle, Users, Calendar, Utensils, ArrowLeft, CreditCard, DollarSign, ShoppingCart } from 'lucide-react';
import "./TokenGenerationPage.css";

const TokenGenerationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [eventDetails, setEventDetails] = useState(null);
  const [generatedTokens, setGeneratedTokens] = useState([]);
  const [copiedToken, setCopiedToken] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');

  useEffect(() => {
    if (location.state) {
      setMembers(location.state.members || []);
      setEventDetails(location.state.eventDetails);
      generateTokensForMembers(location.state.members);
    } else {
      const demoMembers = [
        { name: "John Doe", email: "john@example.com", selectedMeal: { name: "Grilled Chicken", price: 12.99 } },
        { name: "Jane Smith", email: "jane@example.com", selectedMeal: { name: "Vegetable Pasta", price: 10.99 } },
      ];
      setMembers(demoMembers);
      generateTokensForMembers(demoMembers);
    }
  }, [location.state]);

  const generateTokensForMembers = (membersList) => {
    const tokens = membersList.map((member) => ({
      id: `TKN${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      shortId: `#${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      name: member.name || member.email,
      email: member.email,
      mealSelection: member.selectedMeal || member.selectedMeals || { name: "Not specified", price: 0 },
      generatedAt: new Date().toISOString(),
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${member.id || member.email}`,
      status: 'active',
      paymentStatus: 'pending'
    }));
    setGeneratedTokens(tokens);
  };

  const getTotalAmount = () => generatedTokens.reduce((total, token) => total + (token.paymentStatus === 'pending' ? (token.mealSelection.price || 0) : 0), 0);
  const getPaidAmount = () => generatedTokens.reduce((total, token) => total + (token.paymentStatus === 'paid' ? (token.mealSelection.price || 0) : 0), 0);

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
                <button onClick={() => window.print()} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition flex items-center gap-2">
                  Print
                </button>
                <button className="bg-white text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50 transition flex items-center gap-2 font-semibold shadow-sm">
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
                  <span className="text-gray-700"><strong>Event:</strong> {eventDetails?.name || 'Sliit Smart Canteen'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                  <span className="text-gray-700"><strong>Total Due:</strong> ${getTotalAmount().toFixed(2)}</span>
                </div>
              </div>
              <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition flex items-center gap-2 font-semibold shadow-md">
                <CreditCard className="w-5 h-5" /> Pay All
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
                {generatedTokens.map((token, index) => (
                  <tr key={token.id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{token.name}</div>
                      <div className="text-xs text-gray-500">{token.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Utensils className="w-4 h-4 text-orange-400" /> {token.mealSelection.name}
                      </div>
                      <div className="text-sm font-semibold text-orange-600 mt-1">${token.mealSelection.price?.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="px-2 py-1 bg-orange-100/50 rounded text-sm font-mono text-orange-700 border border-orange-200">
                        {token.id}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        token.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {token.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm">
                        <CreditCard className="w-4 h-4" /> Pay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
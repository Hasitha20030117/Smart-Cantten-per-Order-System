import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Download, QrCode, Copy, CheckCircle, Users, Calendar, Mail, Utensils, ArrowLeft, CreditCard, DollarSign, ShoppingCart } from 'lucide-react';
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
    // Get group and event data from navigation state
    if (location.state) {
      setMembers(location.state.members || []);
      setEventDetails(location.state.eventDetails);
      generateTokensForMembers(location.state.members);
    } else {
      // Demo data for testing
      const demoMembers = [
        { name: "John Doe", email: "john@example.com", selectedMeal: { name: "Grilled Chicken", price: 12.99 } },
        { name: "Jane Smith", email: "jane@example.com", selectedMeal: { name: "Vegetable Pasta", price: 10.99 } },
        { name: "Mike Johnson", email: "mike@example.com", selectedMeal: { name: "Beef Burger", price: 14.99 } },
        { name: "Sarah Williams", email: "sarah@example.com", selectedMeal: { name: "Caesar Salad", price: 9.99 } }
      ];
      setMembers(demoMembers);
      generateTokensForMembers(demoMembers);
    }
  }, [location.state]);

  const generateTokensForMembers = (membersList) => {
    const tokens = membersList.map((member, index) => ({
      id: `TKN${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      shortId: `#${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      name: member.name || member.email,
      email: member.email,
      mealSelection: member.selectedMeal || member.selectedMeals || { name: "Not specified", price: 0 },
      generatedAt: new Date().toISOString(),
      qrCode: generateQRCode(member.id || member.email),
      status: 'active',
      paymentStatus: 'pending' // pending, paid, failed
    }));
    setGeneratedTokens(tokens);
  };

  const generateQRCode = (memberId) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${memberId}`;
  };

  const downloadAllTokens = () => {
    const tokenData = generatedTokens.map(token => ({
      'Member Name': token.name,
      'Email': token.email,
      'Token ID': token.id,
      'Short ID': token.shortId,
      'Meal': token.mealSelection.name,
      'Price': `$${token.mealSelection.price || 0}`,
      'Payment Status': token.paymentStatus,
      'Generated At': new Date(token.generatedAt).toLocaleString()
    }));
    
    const csvContent = convertToCSV(tokenData);
    downloadFile(csvContent, `tokens_${eventDetails?.name || 'event'}.csv`, 'text/csv');
  };

  const convertToCSV = (data) => {
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
    ];
    return csvRows.join('\n');
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const copyToClipboard = (tokenId) => {
    navigator.clipboard.writeText(tokenId);
    setCopiedToken(tokenId);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const downloadSingleToken = (token) => {
    const tokenData = {
      'Token ID': token.id,
      'Member Name': token.name,
      'Email': token.email,
      'Meal': token.mealSelection.name,
      'Price': `$${token.mealSelection.price || 0}`,
      'Payment Status': token.paymentStatus,
      'Generated': new Date(token.generatedAt).toLocaleString()
    };
    
    const csvContent = convertToCSV([tokenData]);
    downloadFile(csvContent, `token_${token.name.replace(/\s/g, '_')}.csv`, 'text/csv');
  };

  const handlePayment = (member) => {
    setSelectedMember(member);
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    // Simulate payment processing
    const updatedTokens = generatedTokens.map(token => {
      if (token.id === selectedMember.id) {
        return { ...token, paymentStatus: 'paid' };
      }
      return token;
    });
    setGeneratedTokens(updatedTokens);
    setShowPaymentModal(false);
    alert(`Payment successful for ${selectedMember.name}! Token has been activated.`);
  };

  const getTotalAmount = () => {
    return generatedTokens.reduce((total, token) => {
      return total + (token.paymentStatus === 'pending' ? (token.mealSelection.price || 0) : 0);
    }, 0);
  };

  const getPaidAmount = () => {
    return generatedTokens.reduce((total, token) => {
      return total + (token.paymentStatus === 'paid' ? (token.mealSelection.price || 0) : 0);
    }, 0);
  };

  const payForAll = () => {
    const pendingTokens = generatedTokens.filter(t => t.paymentStatus === 'pending');
    if (pendingTokens.length === 0) {
      alert('All tokens are already paid!');
      return;
    }
    setSelectedMember({ name: 'All Members', id: 'all', price: getTotalAmount() });
    setShowPaymentModal(true);
  };

  const processBulkPayment = async () => {
    const updatedTokens = generatedTokens.map(token => {
      if (token.paymentStatus === 'pending') {
        return { ...token, paymentStatus: 'paid' };
      }
      return token;
    });
    setGeneratedTokens(updatedTokens);
    setShowPaymentModal(false);
    alert(`Bulk payment successful! All pending tokens have been activated.`);
  };

  const printTokens = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
        </div>

        {/* Main Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Individual Tokens</h1>
                <p className="text-indigo-100">Unique tokens generated for each group member</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={printTokens}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
                <button
                  onClick={downloadAllTokens}
                  className="bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition flex items-center gap-2 font-semibold"
                >
                  <Download className="w-5 h-5" />
                  Download All Tokens
                </button>
              </div>
            </div>
          </div>

          {/* Event Summary with Payment Info */}
          <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-4">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  <span className="text-gray-700">
                    <strong>Event:</strong> {eventDetails?.name || 'Smart Cantten Event'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span className="text-gray-700">
                    <strong>Participants:</strong> {members.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-indigo-600" />
                  <span className="text-gray-700">
                    <strong>Total Due:</strong> ${getTotalAmount().toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">
                    <strong>Paid:</strong> ${getPaidAmount().toFixed(2)}
                  </span>
                </div>
              </div>
              <button
                onClick={payForAll}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition flex items-center gap-2 font-semibold shadow-md"
              >
                <CreditCard className="w-5 h-5" />
                Pay All (${getTotalAmount().toFixed(2)})
              </button>
            </div>
          </div>

          {/* Tokens Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Member Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Meal & Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Token ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    QR Code
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {generatedTokens.map((token, index) => (
                  <tr key={token.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{token.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {token.email}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{token.mealSelection.name}</span>
                      </div>
                      <div className="text-sm font-semibold text-indigo-600 mt-1">
                        ${token.mealSelection.price?.toFixed(2) || '0.00'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-indigo-600">
                          {token.id}
                        </code>
                        <button
                          onClick={() => copyToClipboard(token.id)}
                          className="text-gray-400 hover:text-indigo-600 transition"
                          title="Copy token"
                        >
                          {copiedToken === token.id ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <div className="text-xs text-gray-400 mt-1 font-mono">
                        Short: {token.shortId}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <img 
                          src={token.qrCode} 
                          alt="QR" 
                          className="w-10 h-10 rounded border border-gray-200"
                        />
                        <button
                          onClick={() => window.open(token.qrCode, '_blank')}
                          className="text-gray-400 hover:text-indigo-600"
                          title="View QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        token.paymentStatus === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : token.paymentStatus === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {token.paymentStatus === 'paid' ? '✓ Paid' : token.paymentStatus === 'failed' ? '❌ Failed' : '⏳ Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {token.paymentStatus === 'pending' ? (
                          <button
                            onClick={() => handlePayment(token)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                          >
                            <CreditCard className="w-4 h-4" />
                            Pay Now
                          </button>
                        ) : (
                          <button
                            onClick={() => downloadSingleToken(token)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition text-sm"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer with Summary */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div className="text-sm text-gray-600">
                Total Tokens: <strong className="text-indigo-600">{generatedTokens.length}</strong> | 
                Paid: <strong className="text-green-600">{generatedTokens.filter(t => t.paymentStatus === 'paid').length}</strong> | 
                Pending: <strong className="text-yellow-600">{generatedTokens.filter(t => t.paymentStatus === 'pending').length}</strong>
              </div>
              <div className="text-sm text-gray-500">
                Generated on: {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="text-center mb-6">
                <div className="inline-block bg-green-100 rounded-full p-3 mb-4">
                  <CreditCard className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Payment</h2>
                <p className="text-gray-600 mt-2">
                  {selectedMember?.name === 'All Members' 
                    ? `Pay for all pending tokens (${generatedTokens.filter(t => t.paymentStatus === 'pending').length} items)`
                    : `Pay for ${selectedMember?.name}'s meal`}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Item:</span>
                    <span className="font-medium">
                      {selectedMember?.name === 'All Members' 
                        ? 'Multiple meals' 
                        : selectedMember?.mealSelection?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="text-2xl font-bold text-indigo-600">
                      ${selectedMember?.price?.toFixed(2) || selectedMember?.mealSelection?.price?.toFixed(2) || getTotalAmount().toFixed(2)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 border rounded-lg flex items-center justify-center gap-2 ${
                        paymentMethod === 'card' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                      Card
                    </button>
                    <button
                      onClick={() => setPaymentMethod('paypal')}
                      className={`p-3 border rounded-lg flex items-center justify-center gap-2 ${
                        paymentMethod === 'paypal' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                      }`}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      PayPal
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={selectedMember?.name === 'All Members' ? processBulkPayment : processPayment}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  Pay Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Print Styles */}
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .min-h-screen, .min-h-screen * {
              visibility: visible;
            }
            .min-h-screen {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              margin: 0;
              padding: 0;
            }
            button {
              display: none !important;
            }
            .bg-gradient-to-r {
              background: #4f46e5 !important;
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
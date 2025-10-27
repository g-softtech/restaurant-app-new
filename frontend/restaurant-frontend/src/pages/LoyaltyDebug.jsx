import React, { useState } from 'react';
import { Bug, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const LoyaltyDebugTool = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api';

  const runDiagnostics = async () => {
    setLoading(true);
    const diagnostics = {
      token: null,
      userInfo: null,
      loyaltyInfo: null,
      recentOrders: null,
      errors: []
    };

    try {
      // Check 1: Token exists
      const token = localStorage.getItem('token');
      diagnostics.token = token ? '✅ Token found' : '❌ No token found';

      if (!token) {
        diagnostics.errors.push('User not logged in');
        setResults(diagnostics);
        setLoading(false);
        return;
      }

      // Check 2: User info
      try {
        const userRes = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = await userRes.json();
        diagnostics.userInfo = userData.success ? 
          `✅ User: ${userData.user?.name} (${userData.user?.email})` : 
          '❌ Failed to fetch user info';
      } catch (err) {
        diagnostics.userInfo = `❌ Error: ${err.message}`;
        diagnostics.errors.push('Cannot fetch user info');
      }

      // Check 3: Loyalty info
      try {
        const loyaltyRes = await fetch(`${API_BASE_URL}/loyalty/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const loyaltyData = await loyaltyRes.json();
        
        if (loyaltyData.success) {
          diagnostics.loyaltyInfo = {
            status: '✅ Loyalty system working',
            points: loyaltyData.loyalty.points,
            totalEarned: loyaltyData.loyalty.totalEarned,
            totalRedeemed: loyaltyData.loyalty.totalRedeemed,
            tier: loyaltyData.loyalty.tier,
            transactions: loyaltyData.loyalty.recentTransactions?.length || 0
          };
        } else {
          diagnostics.loyaltyInfo = `❌ ${loyaltyData.message}`;
          diagnostics.errors.push('Loyalty info fetch failed');
        }
      } catch (err) {
        diagnostics.loyaltyInfo = `❌ Error: ${err.message}`;
        diagnostics.errors.push('Cannot fetch loyalty info');
      }

      // Check 4: Recent orders
      try {
        const ordersRes = await fetch(`${API_BASE_URL}/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const ordersData = await ordersRes.json();
        
        if (ordersData.success) {
          const orders = ordersData.orders || [];
          const deliveredOrders = orders.filter(o => o.status === 'delivered');
          const ordersWithPoints = orders.filter(o => o.pointsAwarded);
          
          diagnostics.recentOrders = {
            status: '✅ Orders found',
            total: orders.length,
            delivered: deliveredOrders.length,
            withPointsAwarded: ordersWithPoints.length,
            pendingPoints: deliveredOrders.length - ordersWithPoints.length,
            orders: orders.slice(0, 5).map(o => ({
              id: o._id,
              status: o.status,
              pointsEarned: o.pointsEarned,
              pointsAwarded: o.pointsAwarded,
              total: o.totalAmount
            }))
          };
        } else {
          diagnostics.recentOrders = `❌ ${ordersData.message}`;
          diagnostics.errors.push('Orders fetch failed');
        }
      } catch (err) {
        diagnostics.recentOrders = `❌ Error: ${err.message}`;
        diagnostics.errors.push('Cannot fetch orders');
      }

    } catch (error) {
      diagnostics.errors.push(`Unexpected error: ${error.message}`);
    }

    setResults(diagnostics);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bug className="h-8 w-8 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">Loyalty Points Debugger</h2>
        </div>
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-gray-400"
        >
          {loading ? 'Running...' : 'Run Diagnostics'}
        </button>
      </div>

      {results && (
        <div className="space-y-4">
          {/* Token Check */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">1. Authentication</h3>
            <p className="text-sm">{results.token}</p>
          </div>

          {/* User Info Check */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">2. User Information</h3>
            <p className="text-sm">{results.userInfo}</p>
          </div>

          {/* Loyalty Info Check */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">3. Loyalty System</h3>
            {typeof results.loyaltyInfo === 'string' ? (
              <p className="text-sm">{results.loyaltyInfo}</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm">{results.loyaltyInfo.status}</p>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="bg-white p-3 rounded">
                    <p className="text-xs text-gray-600">Current Points</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {results.loyaltyInfo.points}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="text-xs text-gray-600">Total Earned</p>
                    <p className="text-2xl font-bold text-green-600">
                      {results.loyaltyInfo.totalEarned}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="text-xs text-gray-600">Total Redeemed</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {results.loyaltyInfo.totalRedeemed}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="text-xs text-gray-600">Tier</p>
                    <p className="text-2xl font-bold text-blue-600 uppercase">
                      {results.loyaltyInfo.tier}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Transactions: {results.loyaltyInfo.transactions}
                </p>
              </div>
            )}
          </div>

          {/* Orders Check */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">4. Recent Orders</h3>
            {typeof results.recentOrders === 'string' ? (
              <p className="text-sm">{results.recentOrders}</p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm">{results.recentOrders.status}</p>
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-white p-2 rounded text-center">
                    <p className="text-xs text-gray-600">Total Orders</p>
                    <p className="text-xl font-bold">{results.recentOrders.total}</p>
                  </div>
                  <div className="bg-white p-2 rounded text-center">
                    <p className="text-xs text-gray-600">Delivered</p>
                    <p className="text-xl font-bold text-green-600">
                      {results.recentOrders.delivered}
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded text-center">
                    <p className="text-xs text-gray-600">Points Awarded</p>
                    <p className="text-xl font-bold text-purple-600">
                      {results.recentOrders.withPointsAwarded}
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded text-center">
                    <p className="text-xs text-gray-600">Pending Points</p>
                    <p className="text-xl font-bold text-orange-600">
                      {results.recentOrders.pendingPoints}
                    </p>
                  </div>
                </div>

                {results.recentOrders.orders.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Order Details:</p>
                    <div className="space-y-2">
                      {results.recentOrders.orders.map((order, idx) => (
                        <div key={idx} className="bg-white p-3 rounded border">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs text-gray-600">
                                Order ID: {order.id.slice(-8)}
                              </p>
                              <p className="text-sm font-medium">
                                Status: <span className="text-blue-600">{order.status}</span>
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold">₦{order.total}</p>
                              <p className="text-xs text-gray-600">
                                Points: {order.pointsEarned || 0}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            {order.pointsAwarded ? (
                              <span className="flex items-center text-xs text-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Points Awarded
                              </span>
                            ) : order.status === 'delivered' ? (
                              <span className="flex items-center text-xs text-orange-600">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Delivered but points not awarded!
                              </span>
                            ) : (
                              <span className="flex items-center text-xs text-gray-600">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Points pending (order not delivered)
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Errors Summary */}
          {results.errors.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">Issues Found:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {results.errors.map((error, idx) => (
                      <li key={idx} className="text-sm text-red-700">{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Success Summary */}
          {results.errors.length === 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <p className="text-sm font-medium text-green-900">
                  All systems operational! ✅
                </p>
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Recommendations:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
              {results.recentOrders?.pendingPoints > 0 && (
                <li>
                  You have {results.recentOrders.pendingPoints} delivered order(s) waiting for points.
                  The admin needs to mark these as delivered again to trigger point awarding.
                </li>
              )}
              {typeof results.loyaltyInfo === 'object' && results.loyaltyInfo.points === 0 && results.recentOrders?.total === 0 && (
                <li>
                  Place your first order to start earning loyalty points!
                </li>
              )}
              {typeof results.loyaltyInfo === 'string' && results.loyaltyInfo.includes('❌') && (
                <li>
                  Run the database migration script to add loyalty fields to your user account.
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyDebugTool;
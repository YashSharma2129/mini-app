import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity,
  UserCheck,
  UserX,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { toast } from '../hooks/use-toast';

const Admin = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'Admin privileges required.',
        variant: 'destructive',
      });
      return;
    }
    fetchAdminData();
  }, [user]);

  const fetchAdminData = async () => {
    try {
      const [usersResponse, statsResponse] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/dashboard')
      ]);
      
      setUsers(usersResponse.data.data.users);
      setStats(statsResponse.data.data.stats);
      setRecentTransactions(statsResponse.data.data.recent_transactions);
      setTopProducts(statsResponse.data.data.top_products);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admin data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      if (action === 'update_wallet') {
        const amount = prompt('Enter amount to add to wallet:');
        if (amount && !isNaN(amount)) {
          await api.put(`/admin/users/${userId}/wallet`, { amount: parseFloat(amount) });
          toast({
            title: 'Success',
            description: `Wallet updated for user ${userId}`,
          });
          fetchAdminData(); // Refresh data
        }
      } else {
        toast({
          title: 'Info',
          description: `Action ${action} not implemented yet`,
        });
      }
    } catch (error) {
      console.error('Error performing user action:', error);
      toast({
        title: 'Error',
        description: 'Failed to perform user action',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <UserX className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have admin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, transactions, and platform settings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-blue-900">{users.length}</p>
                </div>
                <div className="p-3 bg-blue-500 rounded-full shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">Total Transactions</p>
                  <p className="text-2xl font-bold text-green-900">{transactions.length}</p>
                </div>
                <div className="p-3 bg-green-500 rounded-full shadow-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600 mb-1">Total Volume</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    ₹{transactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="p-3 bg-yellow-500 rounded-full shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">KYC Approved</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {users.filter(u => u.kyc_status === 'approved').length}
                  </p>
                </div>
                <div className="p-3 bg-purple-500 rounded-full shadow-lg">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Users Management */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-blue-900">Users Management</CardTitle>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-48"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={user.kyc_status === 'approved' ? 'default' : 'secondary'}>
                            {user.kyc_status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{user.wallet_balance.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'view')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'more')}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b">
              <CardTitle className="text-lg font-semibold text-green-900">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.user_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.product_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={transaction.type === 'buy' ? 'default' : 'destructive'}>
                            {transaction.type}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{transaction.amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;

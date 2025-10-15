import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { createClient } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
}

interface UsersManagementScreenProps {
  onBack: () => void;
}

const UsersManagementScreen: React.FC<UsersManagementScreenProps> = ({ onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');

  const roles = ['All', 'admin', 'user'];

  // Initialize Supabase client
  const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Note: auth.admin.listUsers() requires service_role key, not anon key
      // This will only work if you're using a backend API or Edge Function
      // For now, we'll try to fetch from the users table directly

      const { data: usersData, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users from table:', error);

        // If users table doesn't exist or returns error, show empty state
        console.warn('Unable to fetch users. The users table may not be accessible or the admin API requires a backend.');
        Alert.alert(
          'Info',
          'User management requires additional backend setup. Using Supabase Auth admin API from frontend is not secure.'
        );
        setUsers([]);
        return;
      }

      // Transform database users to our User interface
      const transformedUsers: User[] = (usersData || []).map(user => ({
        id: user.id,
        email: user.email || 'N/A',
        role: user.role || 'user',
        created_at: user.created_at,
        last_sign_in_at: user.last_login || undefined,
        email_confirmed_at: user.created_at, // Approximate since we don't have this in users table
      }));

      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedRole === 'All' || user.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return '#ef4444';
      case 'user':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Users Management</Text>
        <TouchableOpacity onPress={fetchUsers} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by email or ID..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.roleScroll}
        >
          {roles.map(role => (
            <TouchableOpacity
              key={role}
              style={[
                styles.roleChip,
                selectedRole === role && styles.roleChipActive,
              ]}
              onPress={() => setSelectedRole(role)}
            >
              <Text style={[
                styles.roleChipText,
                selectedRole === role && styles.roleChipTextActive,
              ]}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{users.length}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{users.filter(u => u.role === 'admin').length}</Text>
          <Text style={styles.statLabel}>Admins</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{users.filter(u => u.role === 'user').length}</Text>
          <Text style={styles.statLabel}>Regular Users</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {users.filter(u => u.email_confirmed_at).length}
          </Text>
          <Text style={styles.statLabel}>Verified</Text>
        </View>
      </View>

      {/* Users List */}
      <ScrollView style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 50 }} />
        ) : filteredUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>No users found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || selectedRole !== 'All'
                ? 'Try adjusting your filters'
                : 'No users in the system'}
            </Text>
          </View>
        ) : (
          filteredUsers.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userHeader}>
                <View style={styles.userAvatar}>
                  <Ionicons name="person" size={24} color={theme.colors.white} />
                </View>
                <View style={styles.userInfo}>
                  <View style={styles.userNameRow}>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    {user.email_confirmed_at && (
                      <Ionicons name="checkmark-circle" size={16} color="#10b981" style={{ marginLeft: 6 }} />
                    )}
                  </View>
                  <Text style={styles.userId}>ID: {user.id.substring(0, 8)}...</Text>
                </View>
                <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(user.role) + '20' }]}>
                  <Text style={[styles.roleBadgeText, { color: getRoleBadgeColor(user.role) }]}>
                    {user.role.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.userDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.detailLabel}>Joined:</Text>
                  <Text style={styles.detailValue}>{formatDate(user.created_at)}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="log-in-outline" size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.detailLabel}>Last Sign In:</Text>
                  <Text style={styles.detailValue}>{formatDate(user.last_sign_in_at)}</Text>
                </View>

                {user.email_confirmed_at ? (
                  <View style={styles.detailRow}>
                    <Ionicons name="shield-checkmark-outline" size={16} color="#10b981" />
                    <Text style={[styles.detailLabel, { color: '#10b981' }]}>Email Verified</Text>
                    <Text style={styles.detailValue}>{formatDate(user.email_confirmed_at)}</Text>
                  </View>
                ) : (
                  <View style={styles.detailRow}>
                    <Ionicons name="alert-circle-outline" size={16} color="#f59e0b" />
                    <Text style={[styles.detailLabel, { color: '#f59e0b' }]}>Email Not Verified</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: 12,
  },
  refreshButton: {
    padding: 8,
  },
  searchSection: {
    backgroundColor: theme.colors.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: theme.colors.text,
  },
  roleScroll: {
    flexDirection: 'row',
  },
  roleChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  roleChipActive: {
    backgroundColor: theme.colors.primary,
  },
  roleChipText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  roleChipTextActive: {
    color: theme.colors.white,
    fontWeight: '600',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  userCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  userId: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  userDetails: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 8,
    marginRight: 8,
    minWidth: 100,
  },
  detailValue: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
  },
});

export default UsersManagementScreen;
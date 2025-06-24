import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { getSegments, getRules, Rule, Segment } from '../services/api';

interface DashboardStats {
  totalSegments: number;
  totalRules: number;
  totalUsers: number;
  lastUpdated: string;
}

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalSegments: 0,
    totalRules: 0,
    totalUsers: 0,
    lastUpdated: new Date().toISOString(),
  });
  const [recentSegments, setRecentSegments] = useState<Segment[]>([]);
  const [recentRules, setRecentRules] = useState<Rule[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rulesRes, segmentsRes] = await Promise.all([
          getRules(),
          getSegments(),
        ]);

        const rulesData = rulesRes.data.data;
        const segmentsData = segmentsRes.data.data;

        const rules = rulesData.items || [];
        const segments = segmentsData.items || [];

        setStats({
          totalSegments: segmentsData.total_items || 0,
          totalRules: rulesData.total_items || 0,
          totalUsers: segments.reduce(
            (sum: number, segment: Segment) => sum + (segment.row_count || 0),
            0
          ),
          lastUpdated: new Date().toISOString(),
        });

        setRecentSegments(segments.slice(0, 3));
        setRecentRules(rules.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <span className="text-sm text-gray-500">
          Last updated: {new Date(stats.lastUpdated).toLocaleString()}
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          title="Total Segments"
          value={stats.totalSegments}
          description={`${stats.totalSegments} active segments`}
        />
        <Card
          title="Total Rules"
          value={stats.totalRules}
          description={`${stats.totalRules} active rules`}
        />
        <Card
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          description="Across all segments"
        />
      </div>

      {/* Recent Segments */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Segments
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Most recently updated segments
          </p>
        </div>
        <div className="bg-white overflow-hidden">
          {recentSegments.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {recentSegments.map((segment) => (
                <li key={segment.id}>
                  <Link
                    to={`/segments/${segment.id}`}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {segment.segment_name}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {segment.row_count} users
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {segment.description}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            Updated{' '}
                            {new Date(
                              segment.last_refreshed_at
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No segments found. Create your first segment to get started.
            </div>
          )}
          <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
            <Link
              to="/segments"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all segments
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Rules */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Rules
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Most recently executed rules
          </p>
        </div>
        <div className="bg-white overflow-hidden">
          {recentRules.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {recentRules.map((rule) => (
                <li key={rule.id}>
                  <Link
                    to={`/rules/${rule.id}`}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {rule.rule_name}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              rule.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {rule.is_active ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {rule.description}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p className="mt-1 text-sm text-gray-500">
                            Last run:{' '}
                            {rule.last_run_at
                              ? new Date(
                                  rule.last_run_at
                                ).toLocaleString()
                              : 'Never'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No rules found. Create your first rule to get started.
            </div>
          )}
          <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
            <Link
              to="/rules"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all rules
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

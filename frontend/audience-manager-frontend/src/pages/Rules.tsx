import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRules, triggerRule, deleteRule, Rule } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
}

const Rules: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [triggeringId, setTriggeringId] = useState<number | null>(null);

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const response = await getRules();
      const rulesList = response.data?.data?.items || [];
      setRules(rulesList);
      setError(null); // Clear previous errors
    } catch (err) {
      setError('Failed to fetch rules.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleTrigger = async (id: number) => {
    setTriggeringId(id);
    setNotification({ message: `Triggering rule ${id}...`, type: 'info' });
    try {
      const response = await triggerRule(String(id));
      const successMessage = response.data?.message || `Rule ${id} triggered successfully! The job is running in the background.`;
      setNotification({ message: successMessage, type: 'success' });
      
      setTimeout(() => {
        fetchRules();
        setNotification(null);
        setTriggeringId(null);
      }, 5000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Failed to trigger rule ${id}.`;
      setNotification({ message: errorMessage, type: 'error' });
      console.error('Error triggering rule:', err.response?.data || err);
      setTriggeringId(null);
      
      setTimeout(() => {
        setNotification(null);
      }, 7000);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      try {
        await deleteRule(id);
        setNotification({ message: `Rule ${id} deleted successfully.`, type: 'success' });
        fetchRules(); // Refresh the list
        setTimeout(() => setNotification(null), 3000);
      } catch (err) {
        setNotification({ message: `Failed to delete rule ${id}.`, type: 'error' });
        console.error(err);
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {notification && (
        <div 
          className={`border-l-4 p-4 mb-4 rounded-md ${
            notification.type === 'success' ? 'bg-green-100 border-green-500 text-green-700' :
            notification.type === 'error' ? 'bg-red-100 border-red-500 text-red-700' :
            'bg-blue-100 border-blue-500 text-blue-700'
          }`} 
          role="alert"
        >
          <p>{notification.message}</p>
        </div>
      )}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Rules</h1>
          <p className="mt-2 text-sm text-gray-700">A list of all the rules for creating user segments.</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/rules/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Create Rule
          </Link>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Last Run</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {rules.length > 0 ? (
                    rules.map((rule) => (
                      <tr key={rule.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <Link to={`/rules/${rule.id}`} className="font-medium text-indigo-600 hover:text-indigo-900">
                            {rule.rule_name}
                          </Link>
                          <p className="text-gray-500">{rule.description}</p>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${rule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {rule.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {rule.last_run_at ? new Date(rule.last_run_at).toLocaleString() : 'Never'}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <Link to={`/rules/edit/${rule.id}`} className="text-indigo-600 hover:text-indigo-900">
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(rule.id)}
                            className="ml-4 text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => handleTrigger(rule.id)}
                            className="ml-4 text-green-600 hover:text-green-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                            disabled={triggeringId === rule.id || (triggeringId !== null && triggeringId !== rule.id)}
                          >
                            {triggeringId === rule.id ? 'Triggering...' : 'Trigger'}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-gray-500">
                        No rules found. <Link to="/rules/new" className="text-indigo-600">Create one now</Link>.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rules;

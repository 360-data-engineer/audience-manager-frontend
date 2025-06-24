import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getRuleById, triggerRule, Rule, Condition } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Card } from '../components/common/Card';

const RuleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rule, setRule] = useState<Rule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);

  // Memoize parsed conditions. This hook is now at the top level.
  const parsedConditions = React.useMemo(() => {
    if (!rule?.conditions) {
      return [];
    }
    // Handle conditions stored as a JSON string
    if (typeof rule.conditions === 'string') {
      try {
        return JSON.parse(rule.conditions);
      } catch (e) {
        console.error("Error parsing rule conditions:", e);
        // Avoid setting state in render. Log error and return empty.
        return [];
      }
    }
    // Handle conditions that are already objects/arrays
    return rule.conditions;
  }, [rule]);

  useEffect(() => {
    if (!id) return;

    const fetchRule = async () => {
      try {
        setIsLoading(true);
        const response = await getRuleById(id);
        setRule(response.data.data);
      } catch (err) {
        setError('Failed to fetch rule details.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRule();
  }, [id]);

  const handleTriggerRule = async () => {
    if (!id) return;
    setIsTriggering(true);
    try {
      await triggerRule(id);
      alert('Rule triggered successfully!');
      // Optionally, you might want to re-fetch the rule to show updated status
    } catch (err) {
      alert('Failed to trigger rule.');
      console.error(err);
    } finally {
      setIsTriggering(false);
    }
  };

  const renderCondition = (condition: Condition, index: number) => {
    return (
      <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
        <span className="font-mono text-sm text-gray-700">{condition.field}</span>
        <span className="font-mono text-sm text-blue-600">{condition.operator}</span>
        <span className="font-mono text-sm text-purple-700 bg-purple-100 px-2 py-1 rounded">{String(condition.value)}</span>
        {condition.value2 && (
            <>
                <span className="font-mono text-sm text-gray-500">AND</span>
                <span className="font-mono text-sm text-purple-700 bg-purple-100 px-2 py-1 rounded">{String(condition.value2)}</span>
            </>
        )}
      </div>
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  if (!rule) {
    return <p className="text-center">Rule not found.</p>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Rule Details</h1>
        <div>
          <button
            onClick={() => navigate(`/rules/edit/${rule.id}`)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mr-2"
          >
            Edit Rule
          </button>
          <button
            onClick={handleTriggerRule}
            disabled={isTriggering}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-400"
          >
            {isTriggering ? 'Triggering...' : 'Trigger Rule'}
          </button>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-500">Rule Name</h3>
            <p className="mt-1 text-lg font-semibold text-gray-900">{rule.rule_name}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-500">Description</h3>
            <p className="mt-1 text-gray-700">{rule.description || 'N/A'}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-500">Status</h3>
            <p className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${rule.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {rule.is_active ? 'Active' : 'Inactive'}
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-500">Schedule</h3>
            <p className="mt-1 text-gray-700 capitalize">{rule.schedule || 'Run Once'}</p>
          </div>
          <div className="md:col-span-2">
            <h3 className="font-medium text-gray-500">Conditions</h3>
            <div className="mt-2 space-y-2">
                {parsedConditions.map(renderCondition)}
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-500">Created At</h3>
            <p className="mt-1 text-gray-700">{new Date(rule.created_at).toLocaleString()}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-500">Last Run</h3>
            <p className="mt-1 text-gray-700">{rule.last_run_at ? new Date(rule.last_run_at).toLocaleString() : 'Never'}</p>
          </div>
           <div>
            <h3 className="font-medium text-gray-500">Next Run</h3>
            <p className="mt-1 text-gray-700">{rule.next_run_at ? new Date(rule.next_run_at).toLocaleString() : 'Not Scheduled'}</p>
          </div>
        </div>
      </Card>
      <div className="mt-6">
        <Link to="/rules" className="text-indigo-600 hover:text-indigo-900">
          &larr; Back to Rules List
        </Link>
      </div>
    </div>
  );
};

export default RuleDetail;

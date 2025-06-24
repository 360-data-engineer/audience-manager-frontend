import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSegments, Segment, getRules, Rule } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const Segments = () => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [ruleMap, setRuleMap] = useState<Map<number, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [segmentsResponse, rulesResponse] = await Promise.all([
          getSegments(),
          getRules({ page: 1, per_page: 1000 }) // Fetch all rules for lookup
        ]);

        setSegments(segmentsResponse.data.data.items || []);

        const allRules = rulesResponse.data.data.items || [];
        const newRuleMap = new Map<number, string>();
        allRules.forEach((rule) => {
          newRuleMap.set(rule.id, rule.rule_name);
        });
        setRuleMap(newRuleMap);

      } catch (err) {
        setError('Failed to fetch segments or rules. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderDependencies = (segment: Segment) => {
    if (!segment.dependencies || segment.dependencies.length === 0) {
      return <span className="text-gray-500">Direct</span>;
    }

    const dependencyNames = segment.dependencies.map(depId => (
      <Link key={depId} to={`/rules/edit/${depId}`} className="text-blue-600 hover:underline">
        {ruleMap.get(depId) || `Rule #${depId}`}
      </Link>
    ));

    const operationText = segment.operation ? ` ${segment.operation.toUpperCase()} ` : ' & ';

    return (
      <div className="flex flex-wrap items-center gap-x-1">
        {dependencyNames.reduce((prev, curr, i) => {
          return [...prev, curr, i < dependencyNames.length - 1 ? <span key={`op-${i}`} className="font-bold">{operationText}</span> : null];
        }, [] as React.ReactNode[])}
      </div>
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Segments</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the user segments in your workspace, generated from rules.
          </p>
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
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Users</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Depends On</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Last Refreshed</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {segments.length > 0 ? (
                    segments.map((segment) => (
                      <tr key={segment.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{segment.segment_name}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{segment.description}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{segment.row_count}</td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {renderDependencies(segment)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {segment.last_refreshed_at ? new Date(segment.last_refreshed_at).toLocaleString() : 'Never'}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <Link to={`/segments/${segment.id}`} className="text-indigo-600 hover:text-indigo-900">
                            View<span className="sr-only">, {segment.segment_name}</span>
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-gray-500">
                        No segments found. Go to the <Link to="/rules" className="text-indigo-600">Rules page</Link> to create one.
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

export default Segments;

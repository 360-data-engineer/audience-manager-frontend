import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSegmentById, getSegmentSampleData, Segment } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Card } from '../components/common/Card';
import { LineageGraph } from '../components/segments/LineageGraph';



interface SampleDataRow {
  [key: string]: any;
}

const SegmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [segment, setSegment] = useState(null as Segment | null);
  const [sampleData, setSampleData] = useState([] as SampleDataRow[]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null as string | null);

  useEffect(() => {
    const fetchSegmentDetails = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const [segmentResponse, sampleDataResponse] = await Promise.all([
          getSegmentById(id),
          getSegmentSampleData(id),
        ]);

        setSegment(segmentResponse.data.data);
        setSampleData(sampleDataResponse.data.data.sample_data || []);
      } catch (err) {
        setError('Failed to fetch segment details.');
        console.error(err);
      }
      setIsLoading(false);
    };

    fetchSegmentDetails();
  }, [id]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !segment) {
    return <div className="text-red-500 text-center p-4">{error || 'Segment not found.'}</div>;
  }

  const dataColumns = sampleData.length > 0 ? Object.keys(sampleData[0]) : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <Link to="/segments" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          &larr; Back to Segments
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">{segment.segment_name}</h1>
        <p className="mt-2 text-lg text-gray-600">{segment.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card title="Total Users">
          <p className="text-3xl font-bold">{segment.row_count.toLocaleString()}</p>
        </Card>
        <Card title="Rule ID">
          <p className="text-3xl font-bold">{segment.rule_id || 'N/A'}</p>
        </Card>
        <Card title="Last Refreshed">
          <p className="text-xl font-semibold">{new Date(segment.last_refreshed_at).toLocaleString()}</p>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Sample Data</h2>
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    {dataColumns.map((col) => (
                      <th key={col} scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {sampleData.length > 0 ? (
                    sampleData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {dataColumns.map((col) => (
                          <td key={col} className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {String(row[col])}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={dataColumns.length || 1} className="text-center py-4 text-gray-500">
                        This segment is empty. No sample data is available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Segment Lineage</h2>
        <LineageGraph segmentId={id!} />
      </div>
    </div>
  );
};

export default SegmentDetail;

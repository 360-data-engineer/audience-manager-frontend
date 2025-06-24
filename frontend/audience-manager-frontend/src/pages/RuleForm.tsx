import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRuleById, createRule, updateRule, RulePayload, Condition as ApiCondition } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

// Interfaces
export type ConditionField = 'transaction_amount' | 'merchant_category' | 'transaction_type' | 'city_tier' | 'transaction_date';

// Local state for conditions, including a frontend-only ID for keys
export interface FormCondition {
  id: number;
  field: ConditionField;
  operator: string;
  value: any;
  value2?: any;
}

// Constants for form fields
const FIELD_OPTIONS: { value: ConditionField; label: string; type: 'string' | 'number' | 'date' | 'tier' }[] = [
  { value: 'transaction_amount', label: 'Transaction Amount', type: 'number' },
  { value: 'merchant_category', label: 'Merchant Category', type: 'string' },
  { value: 'transaction_type', label: 'Transaction Type', type: 'string' },
  { value: 'city_tier', label: 'City Tier', type: 'tier' },
  { value: 'transaction_date', label: 'Transaction Date', type: 'date' },
];

const TIER_OPTIONS = [
  { value: 1, label: 'Tier 1' },
  { value: 2, label: 'Tier 2' },
  { value: 3, label: 'Tier 3' },
];

const OPERATOR_OPTIONS: { [key: string]: { value: string; label: string }[] } = {
  number: [
    { value: '>', label: '>' },
    { value: '<', label: '<' },
    { value: '=', label: '=' },
    { value: '>=', label: '>=' },
    { value: '<=', label: '<=' },
  ],
  string: [
    { value: '=', label: 'is' },
    { value: '!=', label: 'is not' },
    { value: 'IN', label: 'is one of' },
  ],
  date: [
    { value: '>', label: 'after' },
    { value: '<', label: 'before' },
    { value: '=', label: 'on' },
    { value: 'BETWEEN', label: 'between' },
  ],
  tier: [
    { value: '=', label: 'is' },
    { value: '!=', label: 'is not' },
  ],
};

// Helper to get operators for a given field type
const getOperatorsForField = (fieldType: 'string' | 'number' | 'date' | 'tier') => {
  return OPERATOR_OPTIONS[fieldType as keyof typeof OPERATOR_OPTIONS] || [];
};

const RuleForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewRule = !id;

  const [ruleDetails, setRuleDetails] = useState({ name: '', description: '', schedule: 'once' });
  const [conditions, setConditions] = useState<FormCondition[]>([]);
  const [isLoading, setIsLoading] = useState(!isNewRule);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isNewRule) {
      const fetchRule = async () => {
        setIsLoading(true);
        try {
          const response = await getRuleById(id!);
          const ruleData = response.data.data;
          setRuleDetails({
            name: ruleData.rule_name,
            description: ruleData.description,
            schedule: ruleData.schedule || 'once',
          });
          if (ruleData.conditions && Array.isArray(ruleData.conditions)) {
            const formConditions = ruleData.conditions.map((c: ApiCondition, index: number) => ({ ...c, id: Date.now() + index, field: c.field as ConditionField }));
            setConditions(formConditions);
          }
        } catch (err) {
          setError('Failed to fetch rule details.');
          console.error(err);
        }
        setIsLoading(false);
      };
      fetchRule();
    }
  }, [id, isNewRule]);

  const handleDetailChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRuleDetails((prev) => ({ ...prev, [name]: value }));
  };

  const addCondition = () => {
    setConditions([...conditions, { id: Date.now(), field: 'transaction_amount', operator: '>', value: '' }]);
  };

  const removeCondition = (id: number) => {
    setConditions(prev => prev.filter(c => c.id !== id));
  };

  const handleConditionChange = (id: number, field: keyof FormCondition, value: any) => {
    setConditions(prev => prev.map(c => {
      if (c.id === id) {
        const updatedCondition = { ...c, [field]: value };
        if (field === 'field') {
          const fieldMeta = FIELD_OPTIONS.find(f => f.value === value);
          if (fieldMeta) {
            const newOperators = getOperatorsForField(fieldMeta.type);
            updatedCondition.operator = newOperators[0]?.value || '';
            updatedCondition.value = ''; // Reset value on field change
            updatedCondition.value2 = '';
          }
        }
        return updatedCondition;
      }
      return c;
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!ruleDetails.name || conditions.length === 0 || conditions.some(c => c.value === '')) {
      setError('Rule Name and at least one complete condition are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const apiConditions: ApiCondition[] = conditions.map(({ id, ...rest }) => rest);

    const payload: RulePayload = {
      rule_name: ruleDetails.name,
      description: ruleDetails.description,
      schedule: ruleDetails.schedule,
      conditions: apiConditions,
    };

    try {
      if (isNewRule) {
        await createRule(payload);
      } else {
        await updateRule(id!, payload);
      }
      navigate('/rules');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to save rule. Please check the details and try again.';
      setError(errorMsg);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const renderCondition = (condition: FormCondition) => {
    const fieldMeta = FIELD_OPTIONS.find(f => f.value === condition.field);
    const fieldType = fieldMeta?.type;
    const operators = fieldType ? getOperatorsForField(fieldType) : [];

    const renderValueInput = () => {
      if (fieldType === 'tier') {
        return (
          <select
            value={condition.value || ''}
            onChange={(e) => handleConditionChange(condition.id, 'value', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
          >
            <option value="">Select Tier</option>
            {TIER_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        );
      }

      if (condition.operator === 'BETWEEN') {
        return (
          <div className="flex items-center space-x-2 w-full">
            <input
              type={fieldType === 'date' ? 'date' : 'number'}
              value={condition.value || ''}
              onChange={(e) => handleConditionChange(condition.id, 'value', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
            />
            <span className="text-gray-500">and</span>
            <input
              type={fieldType === 'date' ? 'date' : 'number'}
              value={condition.value2 || ''}
              onChange={(e) => handleConditionChange(condition.id, 'value2', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
            />
          </div>
        );
      }

      return (
        <input
          type={fieldType === 'date' ? 'date' : fieldType === 'number' ? 'number' : 'text'}
          value={condition.value || ''}
          onChange={(e) => handleConditionChange(condition.id, 'value', e.target.value)}
          placeholder={condition.operator === 'IN' ? 'value1, value2' : 'Value'}
          className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
        />
      );
    };

    return (
      <div key={condition.id} className="grid grid-cols-12 gap-2 items-end p-2 bg-gray-50 rounded-md">
        <div className="col-span-4">
          <label className="block text-sm font-medium text-gray-700">Field</label>
          <select
            value={condition.field}
            onChange={(e) => handleConditionChange(condition.id, 'field', e.target.value as ConditionField)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {FIELD_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        <div className="col-span-3">
          <label className="block text-sm font-medium text-gray-700">Operator</label>
          <select
            value={condition.operator}
            onChange={(e) => handleConditionChange(condition.id, 'operator', e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {operators.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        <div className="col-span-4">
          <label className="block text-sm font-medium text-gray-700">Value</label>
          {renderValueInput()}
        </div>

        <div className="col-span-1 text-right">
          <button type="button" onClick={() => removeCondition(condition.id)} className="text-red-500 hover:text-red-700 font-bold text-xl p-1 rounded-full hover:bg-gray-200">
            &times;
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isNewRule ? 'Create Rule' : 'Edit Rule'}
      </h1>
      <form onSubmit={handleSubmit}>
        <div className="space-y-8 bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
          {/* Rule Details Section */}
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Rule Details</h3>
              <p className="mt-1 text-sm text-gray-500">Define the name and description for your rule.</p>
            </div>
            <div className="mt-5 space-y-6 md:col-span-2 md:mt-0">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Rule Name</label>
                <input type="text" name="name" id="name" value={ruleDetails.name} onChange={handleDetailChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" id="description" rows={3} value={ruleDetails.description} onChange={handleDetailChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="schedule" className="block text-sm font-medium text-gray-700">Schedule</label>
                <select id="schedule" name="schedule" value={ruleDetails.schedule} onChange={handleDetailChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                  <option value="once">Run Once</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
          </div>

          {/* Rule Logic Builder Section */}
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Rule Logic</h3>
              <p className="mt-1 text-sm text-gray-500">Define the conditions for this audience segment. All conditions will be joined by 'AND'.</p>
            </div>
            <div className="mt-5 md:col-span-2 md:mt-0">
              <div className="space-y-4">
                {conditions.map((condition) => renderCondition(condition))}
              </div>
              <button type="button" onClick={addCondition} className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-500">
                + Add Condition
              </button>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end">
          <button type="button" onClick={() => navigate('/rules')} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
            {isSubmitting ? 'Saving...' : 'Save Rule'}
          </button>
        </div>
        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
      </form>
    </div>
  );
};

export default RuleForm;

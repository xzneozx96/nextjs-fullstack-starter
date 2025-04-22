import { useProjectContext } from '@/contexts/ProjectContext';
import React, { useState } from 'react';

const GatherInformationForm: React.FC = () => {
  const {
    formSubmitted,
    setFormSubmitted,
    updateSubtaskStatus,
    setSelectedTask,
    subtasks,
    setClientData,
  } = useProjectContext();

  const [formData, setFormData] = useState({
    businessInfo: '',
    industry: '',
    challenges: '',
    technologies: '',
    targetCustomers: '',
    marketPosition: '',
    differentiators: '',
    organization: '',
    painPoints: '',
    previousSolutions: '',
    legacySystems: '',
    businessObjectives: '',
    projectAlignment: '',
    successOutcomes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const { businessInfo, industry, challenges, technologies } = formData;
    if (!businessInfo || !industry || !challenges || !technologies) {
      alert('Please fill out all required fields');
      return;
    }

    // Combine business and industry information
    const combinedBusinessInfo = `${businessInfo}. Industry: ${industry}`;

    // Update client data state
    setClientData({
      businessInfo: combinedBusinessInfo,
      challenges,
      technologies,
    });

    // Mark form as submitted
    setFormSubmitted(true);

    // Update task status - mark Gather Information as completed
    updateSubtaskStatus('1.1', 'completed');

    // Parent task status will be updated automatically

    // Find the Market Survey task (step 2) and select it to redirect
    const marketSurveyTask = subtasks.find(subtask => subtask.id === '1.2');

    if (marketSurveyTask) {
      // Update Market Survey task status to in-progress
      updateSubtaskStatus('1.2', 'in-progress');
      // Select the Market Survey task to redirect to step 2
      setSelectedTask(marketSurveyTask);
    }
  };

  if (formSubmitted) {
    return (
      <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-700">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-500">
          <p className="text-sm">Information gathered successfully! Proceeding to Market Survey.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-700">
      <h6 className="mb-3 font-medium text-gray-700 dark:text-gray-300">Client Information Form</h6>
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        Please fill out the following form with detailed information about the client's business,
        challenges, and technical environment.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Business Information */}
          <div>
            <label htmlFor="businessInfo" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Business Information
              {' '}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              id="businessInfo"
              name="businessInfo"
              value={formData.businessInfo}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              rows={3}
              placeholder="Describe the client's business, products/services, and market position"
            />
          </div>

          {/* Industry */}
          <div>
            <label htmlFor="industry" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Industry
              {' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="industry"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder="E.g., Healthcare, Finance, E-commerce, etc."
            />
          </div>
        </div>

        {/* Business Challenges */}
        <div>
          <label htmlFor="challenges" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Business Challenges
            {' '}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            id="challenges"
            name="challenges"
            value={formData.challenges}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            rows={3}
            placeholder="Describe the key challenges and pain points the client is facing"
          />
        </div>

        {/* Current Technologies */}
        <div>
          <label htmlFor="technologies" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Current Technologies
            {' '}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            id="technologies"
            name="technologies"
            value={formData.technologies}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            rows={3}
            placeholder="List the technologies, systems, and platforms currently used by the client"
          />
        </div>

        {/* Additional Information Section */}
        <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-700">
          <h6 className="mb-3 font-medium text-gray-700 dark:text-gray-300">Additional Information</h6>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            The following fields are optional but will help generate a more comprehensive market survey and proposal.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Target Customers */}
            <div>
              <label htmlFor="targetCustomers" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Target Customers
              </label>
              <input
                type="text"
                id="targetCustomers"
                name="targetCustomers"
                value={formData.targetCustomers}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                placeholder="Describe the client's target customer segments"
              />
            </div>

            {/* Market Position */}
            <div>
              <label htmlFor="marketPosition" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Market Position
              </label>
              <input
                type="text"
                id="marketPosition"
                name="marketPosition"
                value={formData.marketPosition}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                placeholder="Describe the client's current position in the market"
              />
            </div>

            {/* Key Differentiators */}
            <div>
              <label htmlFor="differentiators" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Key Differentiators
              </label>
              <input
                type="text"
                id="differentiators"
                name="differentiators"
                value={formData.differentiators}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                placeholder="What sets the client apart from competitors"
              />
            </div>

            {/* Organization Structure */}
            <div>
              <label htmlFor="organization" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Organization Structure
              </label>
              <input
                type="text"
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                placeholder="Brief description of the client's organizational structure"
              />
            </div>
          </div>

          {/* Additional Textarea Fields */}
          <div className="mt-4 space-y-4">
            {/* Pain Points */}
            <div>
              <label htmlFor="painPoints" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Specific Pain Points
              </label>
              <textarea
                id="painPoints"
                name="painPoints"
                value={formData.painPoints}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                rows={2}
                placeholder="Detailed description of specific pain points and challenges"
              />
            </div>

            {/* Previous Solutions */}
            <div>
              <label htmlFor="previousSolutions" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Previous Solutions Tried
              </label>
              <textarea
                id="previousSolutions"
                name="previousSolutions"
                value={formData.previousSolutions}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                rows={2}
                placeholder="Solutions the client has tried in the past and their outcomes"
              />
            </div>

            {/* Legacy Systems */}
            <div>
              <label htmlFor="legacySystems" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Legacy Systems
              </label>
              <textarea
                id="legacySystems"
                name="legacySystems"
                value={formData.legacySystems}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                rows={2}
                placeholder="Description of legacy systems that need to be integrated or replaced"
              />
            </div>

            {/* Business Objectives */}
            <div>
              <label htmlFor="businessObjectives" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Business Objectives
              </label>
              <textarea
                id="businessObjectives"
                name="businessObjectives"
                value={formData.businessObjectives}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                rows={2}
                placeholder="Key business objectives the client wants to achieve"
              />
            </div>

            {/* Project Alignment */}
            <div>
              <label htmlFor="projectAlignment" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Project Alignment
              </label>
              <textarea
                id="projectAlignment"
                name="projectAlignment"
                value={formData.projectAlignment}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                rows={2}
                placeholder="How this project aligns with the client's overall strategy"
              />
            </div>

            {/* Success Outcomes */}
            <div>
              <label htmlFor="successOutcomes" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Success Outcomes
              </label>
              <textarea
                id="successOutcomes"
                name="successOutcomes"
                value={formData.successOutcomes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                rows={2}
                placeholder="How the client will measure success for this project"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Submit Information
          </button>
        </div>
      </form>
    </div>
  );
};

export default GatherInformationForm;

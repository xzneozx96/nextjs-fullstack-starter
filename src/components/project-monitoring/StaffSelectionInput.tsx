import React, { useState } from 'react';

type StaffMember = {
  id: string;
  name: string;
  role: string;
};

type StaffSelectionInputProps = {
  selectedStaff: string[];
  onChange: (selectedStaff: string[]) => void;
};

// Sample staff data - in a real app, this would come from an API
const sampleStaffMembers: StaffMember[] = [
  { id: '1', name: 'John Doe', role: 'Project Manager' },
  { id: '2', name: 'Jane Smith', role: 'Business Analyst' },
  { id: '3', name: 'Mike Johnson', role: 'Developer' },
  { id: '4', name: 'Sarah Williams', role: 'Designer' },
  { id: '5', name: 'David Brown', role: 'QA Engineer' },
  { id: '6', name: 'Emily Davis', role: 'UX Researcher' },
  { id: '7', name: 'Alex Wilson', role: 'DevOps Engineer' },
  { id: '8', name: 'Olivia Taylor', role: 'Marketing Specialist' },
];

const StaffSelectionInput: React.FC<StaffSelectionInputProps> = ({ selectedStaff, onChange }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStaff = sampleStaffMembers.filter(
    staff =>
      staff.name.toLowerCase().includes(searchTerm.toLowerCase())
      || staff.role.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleStaffToggle = (staffId: string) => {
    if (selectedStaff.includes(staffId)) {
      onChange(selectedStaff.filter(id => id !== staffId));
    } else {
      onChange([...selectedStaff, staffId]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          placeholder="Search staff by name or role..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            onClick={() => setSearchTerm('')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md dark:border-gray-700">
        {filteredStaff.length > 0
          ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredStaff.map(staff => (
                  <li key={staff.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <label
                      htmlFor={`staff-${staff.id}`}
                      className="flex items-center space-x-3 cursor-pointer"
                      aria-label={`Select ${staff.name} as ${staff.role}`}
                    >
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                        checked={selectedStaff.includes(staff.id)}
                        onChange={() => handleStaffToggle(staff.id)}
                      />
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">{staff.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{staff.role}</p>
                      </div>
                    </label>
                  </li>
                ))}
              </ul>
            )
          : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No staff members found matching "
                {searchTerm}
                "
              </div>
            )}
      </div>

      {selectedStaff.length > 0 && (
        <div className="mt-3">
          <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selected Staff:</h6>
          <div className="flex flex-wrap gap-2">
            {selectedStaff.map((staffId) => {
              const staff = sampleStaffMembers.find(s => s.id === staffId);
              return (
                staff && (
                  <div
                    key={staff.id}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500"
                  >
                    {staff.name}
                    <button
                      type="button"
                      className="ml-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      onClick={() => handleStaffToggle(staff.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffSelectionInput;

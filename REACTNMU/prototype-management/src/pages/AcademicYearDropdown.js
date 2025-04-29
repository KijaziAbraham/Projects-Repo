import React from "react";

const generateAcademicYears = (startYear, numberOfYears = 5) => {
  const years = [];
  for (let i = 0; i < numberOfYears; i++) {
    const from = startYear + i;
    const to = from + 1;
    years.push(`${from}/${to}`);
  }
  return years;
};

const AcademicYearDropdown = ({ value, onChange }) => {
  const currentYear = new Date().getFullYear();
  const academicYears = generateAcademicYears(currentYear - 1, 10); // starts from 1 year before now, for more flexibility

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Academic Year
      </label>
      <select
        value={value}
        onChange={onChange}
        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      >
        <option value="">-- Select Academic Year --</option>
        {academicYears.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AcademicYearDropdown;

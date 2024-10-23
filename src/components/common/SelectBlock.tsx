import React from "react";

interface SelectBlockProps {
  label: string;
  selectedValue: string;
  options: string[];
  backgroundColor: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const SelectBlock: React.FC<SelectBlockProps> = ({ label, selectedValue, options, backgroundColor, onChange }) => (
  <div className="w-full p-1">
    <p
      className="text-2xs text-white text-center border-2 border-black p-1 rounded-t-lg shadow-md shadow-black"
      style={{ backgroundColor }}
    >
      {label}
    </p>
    <div className="text-2xs text-black text-center bg-white border-2 border-black p-1 w-full rounded-b-lg shadow-md shadow-black">
      <select className="w-full" value={selectedValue} onChange={onChange}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  </div>
);

export default SelectBlock;

import React from "react";

interface InputBlockProps {
  label: string;
  value: number;
  backgroundColor: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputBlock: React.FC<InputBlockProps> = ({ label, value, backgroundColor, onChange }) => (
  <div className="w-full p-1">
    <p
      className="text-2xs text-white text-center border-2 border-black p-1 rounded-t-lg shadow-md shadow-black"
      style={{ backgroundColor }}
    >
      {label}
    </p>
    <input
      className="text-2xs text-black text-center bg-white border-2 border-black p-1 w-full rounded-b-lg shadow-md shadow-black"
      type="number"
      value={value}
      onChange={onChange}
    />
  </div>
);

export default InputBlock;

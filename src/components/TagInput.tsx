'use client';

import React, { useState, KeyboardEvent } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
  description?: string;
  icon?: React.ReactNode;
}

const TagInput: React.FC<TagInputProps> = ({
  value = [],
  onChange,
  placeholder = 'Add tags...',
  label,
  description,
  icon
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const addTag = () => {
    const newTag = inputValue.trim();
    if (newTag && !value.includes(newTag)) {
      onChange([...value, newTag]);
    }
    setInputValue(''); // Clear input after adding
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault(); // Prevent form submission or focus change
      addTag();
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      // Remove last tag on backspace if input is empty
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className="mb-4">
      {label && (
        <div className="flex items-center gap-3 mb-2">
           {icon && <span className="text-indigo-600 dark:text-indigo-400">{icon}</span>}
           <label className="block text-black dark:text-white font-medium">
             {label}
           </label>
         </div>
      )}
       {description && <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{description}</p>}
      
      <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 dark:focus-within:ring-indigo-400">
        {value.map((tag, index) => (
          <div key={index} className="flex items-center bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-sm font-medium px-2.5 py-1 rounded-full">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1.5 text-indigo-400 hover:text-indigo-600 dark:text-indigo-500 dark:hover:text-indigo-300 focus:outline-none"
              aria-label={`Remove ${tag}`}
            >
              <XMarkIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : 'Add another...'}
          className="flex-grow px-2 py-1 bg-transparent text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none min-w-[100px]"
        />
      </div>
    </div>
  );
};

export default TagInput; 
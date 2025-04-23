import React from 'react';

export type ModelOption = {
  id: string;
  label: string;
};

export const modelOptions: ModelOption[] = [
  { id: 'openai/gpt-4o-mini', label: 'ChatGPT 4o-mini' },
  { id: 'openai/gpt-4o', label: 'ChatGPT 4o' },
  { id: 'deepseek/deepseek-chat-v3-0324', label: 'Deepseek V3' },
];

type ModelSelectorProps = {
  selectedModel: string;
  onChange: (modelId: string) => void;
  disabled?: boolean;
};

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onChange,
  disabled = false,
}) => {
  return (
    <select
      value={selectedModel}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className="ml-2 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
    >
      {modelOptions.map(model => (
        <option key={model.id} value={model.id}>
          {model.label}
        </option>
      ))}
    </select>
  );
};

export default ModelSelector;

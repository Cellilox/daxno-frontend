'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

type ExpandableDescriptionProps = {
  description: string;
  maxLength?: number;
};

export default function ExpandableDescription({ description, maxLength = 150 }: ExpandableDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!description) {
    return <p className="text-sm text-gray-600">No description available</p>;
  }

  if (description.length <= maxLength) {
    return <p className="text-sm text-gray-600">{description}</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm text-gray-600">
        {isExpanded ? description : `${description.slice(0, maxLength)}...`}
      </p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 w-fit"
      >
        {isExpanded ? (
          <>
            Show less
            <ChevronUp size={14} />
          </>
        ) : (
          <>
            Show more
            <ChevronDown size={14} />
          </>
        )}
      </button>
    </div>
  );
} 
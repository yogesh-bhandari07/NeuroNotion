import React from 'react';
import ReactMarkdown from 'react-markdown';

interface SummaryViewProps {
  markdown: string;
}

const SummaryView: React.FC<SummaryViewProps> = ({ markdown }) => {
  return (
    <div className="space-y-6">
      {/* Main Summary */}
      <div className="prose prose-slate max-w-none p-6 bg-white rounded-xl shadow-sm border border-slate-100">
        <ReactMarkdown
          components={{
            h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-slate-800 mt-6 mb-4 pb-2 border-b border-slate-200" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-xl font-semibold text-slate-700 mt-4 mb-2" {...props} />,
            p: ({ node, ...props }) => <p className="text-slate-600 leading-relaxed mb-4" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-2 mb-4 text-slate-600" {...props} />,
            li: ({ node, ...props }) => <li className="pl-1 marker:text-indigo-500" {...props} />,
            strong: ({ node, ...props }) => <strong className="font-bold text-indigo-700 bg-indigo-50 px-1 rounded" {...props} />,
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default SummaryView;
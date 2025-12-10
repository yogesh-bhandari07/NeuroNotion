import React from 'react';
import { CaseStudy } from '../types';
import { FileText, Target, Lightbulb, CheckCircle, ScrollText } from 'lucide-react';

interface CaseStudyViewProps {
  data: CaseStudy;
}

const CaseStudyView: React.FC<CaseStudyViewProps> = ({ data }) => {
  return (
    <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-lg shadow-sm border border-slate-200 text-slate-800">
      
      {/* Header / Title */}
      <div className="border-b-2 border-slate-800 pb-6 mb-8 text-center">
        <div className="text-sm font-bold tracking-widest text-slate-500 uppercase mb-2">Formal Report</div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 leading-tight">
          {data.title}
        </h1>
      </div>

      <div className="space-y-10">
        
        {/* Executive Summary */}
        <section className="bg-slate-50 p-6 rounded-md border-l-4 border-indigo-600">
          <div className="flex items-center gap-2 mb-3">
            <ScrollText className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold uppercase tracking-wide text-slate-700">Executive Summary</h2>
          </div>
          <p className="text-slate-700 leading-relaxed italic">
            {data.executive_summary}
          </p>
        </section>

        {/* Two Column Layout for Problem & Solution */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Problem Statement */}
          <section>
            <div className="flex items-center gap-2 mb-3 border-b border-slate-200 pb-2">
              <Target className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-bold uppercase tracking-wide text-slate-700">Problem Statement</h2>
            </div>
            <p className="text-slate-600 leading-relaxed text-justify">
              {data.problem_statement}
            </p>
          </section>

          {/* Methodology / Solution */}
          <section>
            <div className="flex items-center gap-2 mb-3 border-b border-slate-200 pb-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold uppercase tracking-wide text-slate-700">Methodology & Solution</h2>
            </div>
            <p className="text-slate-600 leading-relaxed text-justify">
              {data.methodology_solution}
            </p>
          </section>
        </div>

        {/* Key Findings */}
        <section>
          <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold uppercase tracking-wide text-slate-700">Key Findings</h2>
          </div>
          <div className="grid gap-4">
            {data.key_findings.map((finding, index) => (
              <div key={index} className="flex gap-4 p-4 bg-white border border-slate-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">
                  {index + 1}
                </div>
                <p className="text-slate-700 font-medium">{finding}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Conclusion */}
        <section className="mt-8 pt-8 border-t border-slate-200">
          <h2 className="text-lg font-bold uppercase tracking-wide text-slate-700 mb-3">Conclusion</h2>
          <p className="text-slate-600 leading-relaxed">
            {data.conclusion}
          </p>
        </section>

      </div>
    </div>
  );
};

export default CaseStudyView;

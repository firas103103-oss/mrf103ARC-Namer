
import React from 'react';
import type { Constitution, UserData } from '../types';

interface ConstitutionDisplayProps {
  constitution: Constitution;
  userData: UserData;
  onRestart: () => void;
}

const ConstitutionDisplay: React.FC<ConstitutionDisplayProps> = ({ constitution, userData, onRestart }) => {

  const renderContent = (content: string) => {
    return content.split('\n').map((paragraph, index) => (
      <p key={index} className="mb-3 last:mb-0">
        {paragraph}
      </p>
    ));
  };
  
  return (
    <div className="p-8 md:p-12 animate-fade-in bg-white">
      <div className="prose prose-slate max-w-none prose-h2:border-b prose-h2:pb-2 prose-h2:border-slate-200 prose-h3:text-slate-800">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 not-prose">The Constitution of the Union of</h1>
            <h2 className="text-3xl font-serif text-blue-700 mt-2 not-prose">{userData.partnerOneName} &amp; {userData.partnerTwoName}</h2>
        </div>

        <section className="bg-slate-50 p-6 rounded-lg mb-10 border border-slate-200">
            <h2 className="mt-0">Preamble</h2>
            <div className="text-slate-700 italic">{renderContent(constitution.preamble)}</div>
        </section>

        {constitution.sections.map((section, sectionIndex) => (
            <section key={sectionIndex} className="mb-10">
                <h2 className="!text-2xl">{`Chapter ${sectionIndex + 1}: ${section.title}`}</h2>
                {section.articles.map((article, articleIndex) => (
                    <article key={articleIndex} className="mt-6 ml-4">
                        <h3 className="!text-lg !font-semibold">{`Article ${sectionIndex + 1}.${articleIndex + 1}: ${article.title}`}</h3>
                        <div className="text-slate-600">{renderContent(article.content)}</div>
                    </article>
                ))}
            </section>
        ))}

        {constitution.appendices && constitution.appendices.length > 0 && (
             <section className="mb-10 mt-12 pt-8 border-t-2 border-slate-300">
                <h2 className="!text-2xl">Appendices &amp; Tools</h2>
                {constitution.appendices.map((appendix, appendixIndex) => (
                    <article key={appendixIndex} className="mt-6 ml-4 bg-blue-50 p-6 rounded-lg border border-blue-200">
                        <h3 className="!text-lg !font-semibold mt-0">{`Appendix ${String.fromCharCode(65 + appendixIndex)}: ${appendix.title}`}</h3>
                        <div className="text-slate-600">{renderContent(appendix.content)}</div>
                    </article>
                ))}
            </section>
        )}

        <section className="text-center mt-16 pt-8 border-t border-slate-200">
             <h3 className="!text-xl font-semibold">Closing Covenant</h3>
             <div className="text-slate-700 italic mt-4">{renderContent(constitution.closingCovenant)}</div>
             <div className="mt-12 grid grid-cols-2 gap-8 text-left">
                <div>
                    <p className="font-serif border-t-2 border-slate-400 pt-2">{userData.partnerOneName}</p>
                    <p className="text-sm text-slate-500">Signed and Ratified</p>
                </div>
                 <div>
                    <p className="font-serif border-t-2 border-slate-400 pt-2">{userData.partnerTwoName}</p>
                    <p className="text-sm text-slate-500">Signed and Ratified</p>
                </div>
             </div>
        </section>
      </div>

      <div className="mt-16 text-center">
        <button
          onClick={onRestart}
          className="px-8 py-3 bg-slate-700 text-white font-semibold rounded-lg shadow-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all"
        >
          Start Over
        </button>
      </div>
    </div>
  );
};

export default ConstitutionDisplay;

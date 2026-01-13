
import React from 'react';
import type { RelationshipBlueprint, CombinedUserData } from '../types';

interface BlueprintDisplayProps {
  blueprint: RelationshipBlueprint;
  userData: CombinedUserData;
  onRestart: () => void;
}

const BlueprintDisplay: React.FC<BlueprintDisplayProps> = ({ blueprint, userData, onRestart }) => {

  const { relationshipDiagnosis = "No diagnosis was generated.", evaluation, coexistencePlan, constitution } = blueprint;

  const renderContent = (content: string) => {
    if (!content) return <p>No content provided for this section.</p>;
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
            <h1 className="text-4xl font-bold text-slate-900 not-prose">The Relationship Blueprint for</h1>
            <h2 className="text-3xl font-serif text-blue-700 mt-2 not-prose">
              {userData?.partnerOne?.name || 'Partner One'} &amp; {userData?.partnerTwo?.name || 'Partner Two'}
            </h2>
        </div>

        {/* New Blueprint Sections */}
        <section className="bg-slate-50 p-6 rounded-lg mb-10 border border-slate-200 not-prose">
          <h2 className="text-2xl font-bold text-slate-800 mt-0 mb-4">Relationship Diagnosis</h2>
          <p className="text-slate-700 italic">{relationshipDiagnosis}</p>
        </section>

        <section className="grid md:grid-cols-2 gap-8 mb-12 not-prose">
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-emerald-800 mt-0 mb-4">Strengths</h3>
                <ul className="list-disc list-inside space-y-2 text-emerald-700">
                    {evaluation?.strengths && evaluation.strengths.length > 0 
                        ? evaluation.strengths.map((item, i) => <li key={i}>{item}</li>)
                        : <li>No specific strengths were identified.</li>
                    }
                </ul>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-amber-800 mt-0 mb-4">Areas for Growth</h3>
                 <ul className="list-disc list-inside space-y-2 text-amber-700">
                    {evaluation?.areasForGrowth && evaluation.areasForGrowth.length > 0
                        ? evaluation.areasForGrowth.map((item, i) => <li key={i}>{item}</li>)
                        : <li>No specific areas for growth were identified.</li>
                    }
                </ul>
            </div>
        </section>

        <section className="bg-blue-50 p-6 rounded-lg mb-12 border border-blue-200 not-prose">
            <h2 className="text-2xl font-bold text-blue-800 mt-0 mb-4">{coexistencePlan?.title || "Coexistence Plan"}</h2>
            <ol className="list-decimal list-inside space-y-3 text-blue-700 font-medium">
                {coexistencePlan?.steps && coexistencePlan.steps.length > 0
                    ? coexistencePlan.steps.map((step, i) => <li key={i}>{step}</li>)
                    : <li>No specific steps were provided in the plan.</li>
                }
            </ol>
        </section>
        
        <div className="text-center my-12">
          <h2 className="text-3xl font-bold text-slate-900 not-prose border-t pt-8 border-dashed">The Constitution</h2>
          <p className="text-slate-600">Your foundational document for partnership.</p>
        </div>


        {/* Constitution sections - check if constitution exists */}
        {constitution ? (
            <>
                <section className="bg-slate-50 p-6 rounded-lg mb-10 border border-slate-200">
                    <h2 className="mt-0">Preamble</h2>
                    <div className="text-slate-700 italic">{renderContent(constitution.preamble)}</div>
                </section>

                {constitution.sections?.map((section, sectionIndex) => (
                    <section key={sectionIndex} className="mb-10">
                        <h2 className="!text-2xl">{`Chapter ${sectionIndex + 1}: ${section?.title || 'Untitled Chapter'}`}</h2>
                        {section.articles?.map((article, articleIndex) => (
                            <article key={articleIndex} className="mt-6 ml-4">
                                <h3 className="!text-lg !font-semibold">{`Article ${sectionIndex + 1}.${articleIndex + 1}: ${article?.title || 'Untitled Article'}`}</h3>
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
                                <h3 className="!text-lg !font-semibold mt-0">{`Appendix ${String.fromCharCode(65 + appendixIndex)}: ${appendix?.title || 'Untitled Appendix'}`}</h3>
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
                            <p className="font-serif border-t-2 border-slate-400 pt-2">{userData?.partnerOne?.name || 'Partner One'}</p>
                            <p className="text-sm text-slate-500">Signed and Ratified</p>
                        </div>
                        <div>
                            <p className="font-serif border-t-2 border-slate-400 pt-2">{userData?.partnerTwo?.name || 'Partner Two'}</p>
                            <p className="text-sm text-slate-500">Signed and Ratified</p>
                        </div>
                    </div>
                </section>
            </>
        ) : (
             <section className="text-center my-12">
                <p className="text-lg text-slate-600">The constitution could not be generated at this time.</p>
            </section>
        )}
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

export default BlueprintDisplay;

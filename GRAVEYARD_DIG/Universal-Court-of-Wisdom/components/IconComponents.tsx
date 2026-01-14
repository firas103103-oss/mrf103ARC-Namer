
import React from 'react';

const ScaleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l-6-2m6 2l-3 1m-3-1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3m-3 0a3 3 0 01-3-3V8a3 3 0 013-3h12a3 3 0 013 3v8a3 3 0 01-3 3h-3m-6 0a3 3 0 003 3h3a3 3 0 003-3m-6 0V5" />
  </svg>
);

const QuillIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" {...props}>
    <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.444-.32.742-.79.52-1.291l-1.34-3.13a.75.75 0 011.08-1.08l3.13 1.34c.5.222.97-.076 1.291-.52a6.72 6.72 0 001.028-3.583 6.707 6.707 0 00-.106-1.196L17.75 8.25l-3.5-3.5-6.28 6.28-.106 1.196a6.723 6.723 0 003.284 8.405z" clipRule="evenodd" />
    <path d="M18.375 2.25a2.625 2.625 0 00-3.712 0l-1.5 1.5a.75.75 0 000 1.061l3.5 3.5a.75.75 0 001.06 0l1.5-1.5a2.625 2.625 0 000-3.712z" />
  </svg>
);

const StarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" {...props}>
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354l-4.573 2.572c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
);

const IconComponents = { ScaleIcon, QuillIcon, StarIcon };

export default IconComponents;

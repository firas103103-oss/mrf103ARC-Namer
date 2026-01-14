import React from 'react';

export const LightbulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311a7.5 7.5 0 01-7.5 0c-1.421-.668-2.69-1.66-3.638-2.923a12.07 12.07 0 01-3.638-11.41A7.5 7.5 0 0112 3v1.5m0 10.5a2.25 2.25 0 00-2.25 2.25c0 1.242 1.008 2.25 2.25 2.25s2.25-1.008 2.25-2.25c0-1.242-1.008-2.25-2.25-2.25z" />
  </svg>
);

export const LandscapeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

export const CameraIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.776 48.776 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
  </svg>
);

export const VideoCameraIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" />
  </svg>
);

export const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

export const HomeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
    </svg>
);


const AngleGuideBase: React.FC<{ children: React.ReactNode } & React.SVGProps<SVGSVGElement>> = ({ children, ...props }) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Base line */}
    <line x1="10" y1="70" x2="90" y2="70" stroke="rgb(100 116 139)" strokeWidth="1" />
    {/* Object */}
    <rect x="40" y="50" width="20" height="20" fill="rgb(203 213 225)" rx="3" />
    {children}
  </svg>
);

export const AngleGuideMiddleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <AngleGuideBase {...props}>
    <rect x="15" y="40" width="10" height="6" fill="rgb(14 165 233)" rx="1"/>
    <rect x="19" y="37" width="2" height="3" fill="rgb(14 165 233)"/>
    <path d="M 25 43 L 40 55" stroke="rgb(14 165 233)" strokeWidth="1" strokeDasharray="2,2" />
  </AngleGuideBase>
);

export const AngleGuideHighIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <AngleGuideBase {...props}>
    <g transform="rotate(-45, 25, 25)">
      <rect x="15" y="20" width="10" height="6" fill="rgb(14 165 233)" rx="1" />
      <rect x="19" y="17" width="2" height="3" fill="rgb(14 165 233)" />
    </g>
    <path d="M 27 25 L 43 51" stroke="rgb(14 165 233)" strokeWidth="1" strokeDasharray="2,2" />
  </AngleGuideBase>
);

export const AngleGuideLowIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <AngleGuideBase {...props}>
     <g transform="rotate(45, 25, 65)">
      <rect x="15" y="60" width="10" height="6" fill="rgb(14 165 233)" rx="1" />
      <rect x="19" y="57" width="2" height="3" fill="rgb(14 165 233)" />
    </g>
    <path d="M 27 65 L 43 59" stroke="rgb(14 165 233)" strokeWidth="1" strokeDasharray="2,2" />
  </AngleGuideBase>
);
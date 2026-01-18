
import React from 'react';
import { CouncilMemberInfo } from '../types';

interface CouncilMemberProps {
    member: CouncilMemberInfo;
}

const CouncilMember: React.FC<CouncilMemberProps> = ({ member }) => {
    return (
        <div className="flex flex-col items-center text-center">
            <img 
                src={member.avatarUrl} 
                alt={member.name} 
                className="w-24 h-24 rounded-full border-2 border-yellow-300/50 object-cover shadow-lg shadow-yellow-300/20"
            />
            <h3 className="mt-3 font-cinzel text-lg text-yellow-200">{member.name}</h3>
            <p className="text-sm text-gray-400">{member.title}</p>
        </div>
    );
};

export default CouncilMember;

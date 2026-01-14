
export enum AppState {
    FORM,
    LOADING,
    RESULT
}

export interface PartnerData {
    name: string;
    age: number;
    loveLanguage: string;
    communicationStyle: string;
    conflictApproach: string;
    intimacyNeeds: string;
    personalGoals: string;
}

export interface SharedData {
    relationshipHistory: 'stable' | 'rebuilding' | 'new' | 'other';
    sharedGoals: string;
    keyDisagreements: string[];
    additionalDetails: string;
}

export interface CombinedUserData {
    partnerOne: PartnerData;
    partnerTwo: PartnerData;
    shared: SharedData;
}

export interface ConstitutionArticle {
    title: string;
    content: string;
}

export interface ConstitutionSection {
    title: string;
    articles: ConstitutionArticle[];
}

export interface ConstitutionAppendix {
    title: string;
    content: string;
}

export interface Constitution {
    preamble: string;
    sections: ConstitutionSection[];
    closingCovenant: string;
    appendices: ConstitutionAppendix[];
}

export interface RelationshipBlueprint {
    relationshipDiagnosis: string;
    evaluation: {
        strengths: string[];
        areasForGrowth: string[];
    };
    coexistencePlan: {
        title: string;
        steps: string[];
    };
    constitution: Constitution;
}

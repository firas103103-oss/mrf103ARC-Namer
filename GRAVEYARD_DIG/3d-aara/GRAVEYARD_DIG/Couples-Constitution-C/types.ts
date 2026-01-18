
export enum AppState {
    FORM,
    LOADING,
    RESULT
}

export interface UserData {
    partnerOneName: string;
    partnerOneAge: number;
    partnerTwoName: string;
    partnerTwoAge: number;
    relationshipHistory: 'stable' | 'separated' | 'divorced' | 'other';
    disagreements: string[];
    additionalDetails: string;
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


export enum Stage {
  WELCOME,
  OATH,
  SUBMISSION,
  DELIBERATION,
  JUDGMENT,
}

export interface CaseDetails {
  title: string;
  partiesInvolved: string;
  description: string;
}

export interface CouncilMemberInfo {
    name: string;
    title: string;
    avatarUrl: string;
}

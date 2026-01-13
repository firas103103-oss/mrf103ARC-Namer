
export type Sender = 'user' | 'ai' | 'expert-tip';

export interface Message {
  id: string;
  sender: Sender;
  text: string;
}

export enum Stage {
  WELCOME = 0,
  STRATEGY = 1,
  CONTENT_BUILDING = 2,
  MULTIMEDIA = 3,
  ASSEMBLY = 4,
  PUBLISHING = 5,
  FINISHED = 6
}

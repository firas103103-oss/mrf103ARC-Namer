export type XBookEngineConfig = {
    apiUrl: string;
    timeout: number;
};

export type XBookEngineType = {
    id: string;
    name: string;
    description: string;
};

export type ArcEcosystemCommand = {
    command: string;
    description: string;
    execute: () => void;
};
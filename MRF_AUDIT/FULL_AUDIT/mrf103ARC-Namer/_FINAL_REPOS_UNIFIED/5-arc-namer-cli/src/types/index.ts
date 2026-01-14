export type Command = {
    name: string;
    description: string;
    execute: (...args: any[]) => void;
};

export type CLIOptions = {
    verbose?: boolean;
    dryRun?: boolean;
};

export type CommandResult = {
    success: boolean;
    message: string;
};
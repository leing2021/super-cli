export interface ExecPlan {
    command: string;
    args: string[];
    backend: "opencli" | "cli-anything";
    error?: boolean;
    errorMessage?: string;
}

export interface CheckResult {
    name: string;
    status: "ok" | "warning" | "error";
    version?: string;
    fix?: string;
}
export declare function checkNode(): CheckResult;
export declare function checkPython(): CheckResult;
export declare function checkOpencli(): CheckResult;
export declare function checkCliHub(): CheckResult;
export declare function runDiagnostics(): CheckResult[];

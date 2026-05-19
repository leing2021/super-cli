export interface MakeResult {
    type: "url" | "repo" | "unknown";
    guidance: string;
}
export declare function classifySource(source: string): MakeResult;

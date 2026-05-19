#!/usr/bin/env node
export declare const HELP = "super-cli \u2014 \u6781\u7B80 CLI \u8DEF\u7531\u5668\n\nUsage: super-cli <command> [args...]\n\nCommands:\n  list            \u5217\u51FA\u6240\u6709\u53EF\u7528\u76EE\u6807\n  doctor          \u8BCA\u65AD\u73AF\u5883\u72B6\u6001\n  make <source>   \u4E3A\u65B0\u76EE\u6807\u751F\u6210 CLI\n  <target> [args] \u81EA\u52A8\u8DEF\u7531\u5230\u6B63\u786E\u540E\u7AEF\uFF0C\u6267\u884C\u76EE\u6807\u547D\u4EE4\n\nExamples:\n  super-cli list -f json\n  super-cli doctor -f json\n  super-cli hackernews top -f json\n  super-cli make https://xiaohongshu.com\n";
export type CliCommand = "list" | "doctor" | "make" | "help" | "target";
export interface ParsedArgs {
    command: CliCommand;
    target?: string;
    args: string[];
}
/** 解析命令行参数，不依赖 process.exit */
export declare function parse(rawArgs: string[]): ParsedArgs;

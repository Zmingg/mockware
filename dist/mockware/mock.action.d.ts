export declare const SERVER_NAME = "mockware-server";
export declare function start(opts: any): Promise<{}>;
export declare function status(serverMode?: boolean): Promise<{}>;
export declare function stop(mockIdOrNames: any[]): Promise<{}>;
export declare function restart(mockIdOrNames: any): Promise<{}>;

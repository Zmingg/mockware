declare type ProcessMonit = {
    memory: number;
    cpu: number;
};
declare type ProcessDescription = {
    name: string;
    pid: number;
    pm_id: number;
    monit: ProcessMonit;
    pm2_env: any;
};
export { ProcessDescription };

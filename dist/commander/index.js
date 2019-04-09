"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
const inquirer = require("inquirer");
const mockAction = require("../mockware/mock.action");
const _ = require("lodash");
const shelljs = require("shelljs");
const config = require('dotenv').config().parsed;
const { DEFAULT_SERVER_PORT, DEFAULT_MOCK_PORT } = config;
program
    .version('0.0.1')
    .usage('Mockware')
    .command('list', 'List mock services')
    .command('restart [name|id]', 'Restart mock by name|id');
const PROMPT = {
    FILE: {
        type: 'input', name: 'file', message: 'Input file path or url for the new mock',
        validate: (v) => {
            if (v !== '') {
                return true;
            }
            else {
                return 'Invalid path input';
            }
        }
    },
    NAME: {
        type: 'input', name: 'name', message: 'Give a name for the new mock', default: 'mock',
        validate: (v) => __awaiter(this, void 0, void 0, function* () {
            const processList = yield mockAction.status();
            if (_.filter(processList, proc => proc.name === v).length > 0) {
                return `Name ${v} is exist`;
            }
            else if (v === '') {
                return 'Invalid path input';
            }
            else {
                return true;
            }
        })
    },
    PROCESS: {
        type: 'input', name: 'process', message: 'Input process name or pm_id to stop a mock'
    }
};
program
    .command('add')
    .description('Add a new mock service and start, infomation -h, --help')
    .option("-n, --name [name]", "The name of a new mock service")
    .option("-f, --file [path]", "The path or url for a yaml file")
    .option("-p, --port [port]", `Which port to use, defaults to ${DEFAULT_MOCK_PORT}`)
    .action(function (options) {
    return __awaiter(this, void 0, void 0, function* () {
        const hasInputName = options.hasOwnProperty('name');
        const hasInputFile = options.hasOwnProperty('file');
        let file = options.file, name = hasInputName ? options.name : '', port = options.port || DEFAULT_MOCK_PORT;
        const prompts = [];
        !hasInputFile && prompts.push(PROMPT.FILE);
        !hasInputName && prompts.push(PROMPT.NAME);
        if (prompts.length) {
            yield new Promise((resolve, reject) => {
                inquirer
                    .prompt(prompts)
                    .then((answers) => __awaiter(this, void 0, void 0, function* () {
                    file = answers.file || options.file;
                    name = answers.name || options.name;
                    resolve();
                }));
            });
        }
        const res = yield mockAction.start({ file, name, port });
        if (res && res.length) {
            const { PORT } = res[0].pm2_env;
            console.info(`Mock(${name}) started at ${PORT}.`);
        }
    });
});
program.on('command:list', function () {
    return __awaiter(this, void 0, void 0, function* () {
        const procList = yield mockAction.status();
        if (procList && procList.length) {
            shelljs.exec(`echo Id Memory Cpu Port Pid Name|column -t`);
        }
        else {
            console.info('No mock is running');
        }
        procList.forEach(proc => {
            const { name, pm_id, memory, cpu, port, pid } = proc;
            shelljs.exec(`echo ${pm_id} ${Math.round(memory / (1024 * 1024))}M ${cpu}% ${port} ${pid} ${name} |column -t`);
        });
    });
});
program
    .command('remove [process]')
    .alias('rm')
    .description('Remove mock service by process name|id')
    .action(function (proc) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!proc) {
            proc = yield new Promise((resolve) => {
                inquirer
                    .prompt([PROMPT.PROCESS])
                    .then((answers) => __awaiter(this, void 0, void 0, function* () {
                    resolve(answers[PROMPT.PROCESS.name]);
                }));
            });
        }
        const res = yield mockAction.stop([proc]);
        if (res) {
            console.info(`Mock stopped successfully.`);
        }
    });
});
program.on('command:restart', function (options) {
    return __awaiter(this, void 0, void 0, function* () {
        let [proc] = options;
        if (!proc) {
            inquirer
                .prompt([PROMPT.PROCESS])
                .then((answers) => __awaiter(this, void 0, void 0, function* () {
                proc = answers[PROMPT.PROCESS.name];
            }));
        }
        const res = yield mockAction.restart([proc]);
        if (res) {
            console.info(`Mock restart successfully.`);
        }
    });
});
program
    .command('server [env]')
    .description('Run mock server, infomation -h, --help')
    .option("-s, --signal [signal]", "send signal to a master process: start, restart, stop")
    .option("-p, --port [port]", "Which port to use, defaultsto 3000")
    .action(function (env, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const actions = ['start', 'restart', 'stop'];
        let { signal, port = DEFAULT_SERVER_PORT } = options;
        if (_.includes(actions, signal)) {
            const res = signal === 'start'
                ? yield mockAction.start({ port, name: mockAction.SERVER_NAME })
                : yield mockAction[signal]([mockAction.SERVER_NAME]);
            if (res) {
                const message = signal === 'start'
                    ? `Mock server is running at ${port}.`
                    : `Mock server ${signal} successfully.`;
                console.info(message);
            }
            return;
        }
        const res = yield mockAction.status(true);
        if (res) {
            const { memory, cpu, port, pid } = res;
            shelljs.exec(`echo Memory Cpu Port Pid|column -t`);
            shelljs.exec(`echo ${Math.round(memory / (1024 * 1024))}M ${cpu}% ${port} ${pid} |column -t`);
        }
        else {
            console.info('Mock server is not running.');
            console.info('Use `mock server -h|--help` to show options');
        }
    });
});
program.parse(process.argv);
//# sourceMappingURL=index.js.map
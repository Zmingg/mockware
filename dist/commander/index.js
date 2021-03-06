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
const inquirer = require("inquirer");
const mockAction = require("../mock/mock.action");
const _ = require("lodash");
const shelljs = require("shelljs");
const program = require('commander');
const config = require('dotenv').config().parsed;
const { DEFAULT_MOCK_PORT } = config;
const npmConfig = require('../../package.json');
program
    .version(npmConfig.version)
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
program.parse(process.argv);
//# sourceMappingURL=index.js.map
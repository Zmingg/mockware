import * as program from 'commander';
import * as inquirer from 'inquirer';
import * as mockAction from '../mockware/mock.action';
import * as _ from 'lodash';
import * as shelljs from 'shelljs';

const config = require('dotenv').config().parsed;
const {DEFAULT_SERVER_PORT, DEFAULT_MOCK_PORT} = config;
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
      } else {
        return 'Invalid path input';
      }
    }
  },

  NAME: {
    type: 'input', name: 'name', message: 'Give a name for the new mock', default: 'mock',
    validate: async (v) => {
      const processList = await mockAction.status();
      if (_.filter(processList, proc => proc.name === v).length > 0) {
        return `Name ${v} is exist`;
      } else 
      if (v === '') {
        return 'Invalid path input';
      } else {
        return true;
      }
    }
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
  .action(async function(options){
    const hasInputName = options.hasOwnProperty('name');
    const hasInputFile = options.hasOwnProperty('file');

    let file = options.file, 
      name = hasInputName ? options.name : '',
      port = options.port || DEFAULT_MOCK_PORT;

    const prompts = [];
    !hasInputFile && prompts.push(PROMPT.FILE);
    !hasInputName && prompts.push(PROMPT.NAME);

    if (prompts.length) {
      await new Promise((resolve, reject) => {
        inquirer
          .prompt(prompts)
          .then(async answers => {
            file = answers.file || options.file;
            name = answers.name || options.name;
            resolve();
          });
      });
    }

    const res: any = await mockAction.start({file, name, port});

    if (res && res.length) {
      const {PORT} = res[0].pm2_env;
      console.info(`Mock(${name}) started at ${PORT}.`);
    }
  });

program.on('command:list', async function() {
  const procList: any = await mockAction.status();
  if (procList && procList.length) {
    shelljs.exec(`echo Id Memory Cpu Port Pid Name|column -t`);
  } else {
    console.info('No mock is running')
  }
  procList.forEach(proc => {
    const {name, pm_id, memory, cpu, port, pid} = proc;
    shelljs.exec(`echo ${pm_id} ${Math.round(memory / (1024 * 1024))}M ${cpu}% ${port} ${pid} ${name} |column -t`);
  })
});

program
  .command('remove [process]')
  .alias('rm')
  .description('Remove mock service by process name|id')
  .action(async function(proc){
    if (!proc) {
      proc = await new Promise((resolve) => {
        inquirer
        .prompt([PROMPT.PROCESS])
        .then(async answers => {
          resolve(answers[PROMPT.PROCESS.name]);
        });
      })
    }
  
    const res = await mockAction.stop([proc]);
    if (res) {
      console.info(`Mock stopped successfully.`);
    }
  })

program.on('command:restart', async function(options) {
  let [proc] = options;
  if (!proc) {
    inquirer
    .prompt([PROMPT.PROCESS])
    .then(async answers => {
      proc = answers[PROMPT.PROCESS.name];
    });
  }

  const res = await mockAction.restart([proc]);
  if (res) {
    console.info(`Mock restart successfully.`);
  }
});

program
  .command('server [env]')
  .description('Run mock server, infomation -h, --help')
  .option("-s, --signal [signal]", "send signal to a master process: start, restart, stop")
  .option("-p, --port [port]", "Which port to use, defaultsto 3000")
  .action(async function(env, options){
    const actions = ['start', 'restart', 'stop'];
    let {signal, port = DEFAULT_SERVER_PORT} = options;
    if (_.includes(actions, signal)) {
      const res = signal === 'start' 
        ? await mockAction.start({port, name: mockAction.SERVER_NAME}) 
        : await mockAction[signal]([mockAction.SERVER_NAME]);
      if (res) {
        const message = signal === 'start' 
          ? `Mock server is running at ${port}.`
          : `Mock server ${signal} successfully.`
        console.info(message);
      }
      return;
    } 

    const res: any = await mockAction.status(true);
    if (res) {
      const {memory, cpu, port, pid} = res;
      shelljs.exec(`echo Memory Cpu Port Pid|column -t`);
      shelljs.exec(`echo ${Math.round(memory / (1024 * 1024))}M ${cpu}% ${port} ${pid} |column -t`);
    } else {
      console.info('Mock server is not running.')
      console.info('Use `mock server -h|--help` to show options')
    }
  });

program.parse(process.argv);

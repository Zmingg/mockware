import * as program from 'commander';
import * as inquirer from 'inquirer';
import { start, list, stop, restart } from '../mockware/mock.action';
import * as _ from 'lodash';
import * as shelljs from 'shelljs';

program
  .version('0.0.1')
  .command('start [path] [name]', 'Start a new mock service')
  .command('list', 'List the mock services')
  .command('restart [name|id]', 'Restart mock')
  .command('stop [name|id]', 'Stop mock');

const PROMPT = {
  PATH: {
    type: 'input', name: 'path', message: 'Input path or url of the new mock service', 
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
    validate: async(v) => {
      const processList = await list();
      if (_.filter(processList, proc => proc.name === v).length > 0) {
        return `Name ${v} is exist`;
      } else if (v === '') {
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

program.on('command:start', async function(options) {
  let [path, name] = options;

  if (!path || !name) {
    const prompts = [];
    !path && prompts.push(PROMPT.PATH);
    !name && prompts.push(PROMPT.NAME);
    
    await new Promise((resolve, reject) => {
      inquirer
        .prompt(prompts)
        .then(async answers => {
          path = path || answers.path;
          name = name || answers.name;
          resolve();
        });
    });
  }

  const res: any = await start(path, name);

  if (res.length) {
    const {PORT} = res[0].pm2_env;
    console.info(`Mock(${name}) started at ${PORT}.`);
  }
});


program.on('command:list', async function() {
  const dirname = shelljs.pwd();
  shelljs.exec(`chmod -R 755 ${dirname}/src/commander`);

  const procList: any = await list();
  procList.forEach(proc => {
    const {name, pm_id, memory, cpu, port, pid} = proc;
    shelljs.exec(`echo ${pm_id} ${name} ${Math.round(memory / (1024 * 1024))}M ${cpu}% ${port} ${pid} |column -t`);
  })
});

program.on('command:stop', async function(options) {
  let [proc] = options;
  if (!proc) {
    inquirer
    .prompt([PROMPT.PROCESS])
    .then(async answers => {
      proc = answers[PROMPT.PROCESS.name];
    });
  }

  const res = await stop([proc]);
  if (res) {
    console.info(`Mock stopped successfully.`);
  }
});

program.on('command:restart', async function(options) {
  let [proc] = options;
  if (!proc) {
    inquirer
    .prompt([PROMPT.PROCESS])
    .then(async answers => {
      proc = answers[PROMPT.PROCESS.name];
    });
  }

  const res = await restart([proc]);
  if (res) {
    console.info(`Mock restart successfully.`);
  }
});

program.parse(process.argv);

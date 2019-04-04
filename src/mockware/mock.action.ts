import * as pm2 from 'pm2';
import * as detect from 'detect-port';
import { ProcessDescription } from './mock.dto';
import * as _ from 'lodash';
import { Logger } from '../lib/logger';

export const SERVER_NAME = 'mockware-server';

const config = require('dotenv').config().parsed;
const {DEFAULT_MOCK_PORT} = config;
const mockLogger = new Logger();


// pm2: start new mockware
export async function start(opts) {
  const {name, file, port = DEFAULT_MOCK_PORT} = opts;
  const serverMode = name === SERVER_NAME;

  return await new Promise((resolve, reject) => pm2.connect(async err => {
    if (err) {
      mockLogger.error(err);
      process.exit(2);
    }

    // check name exist
    const nameExist = await new Promise((_resolve) => {
      pm2.list((err, processList: ProcessDescription[]) => {
        if (err) {
          mockLogger.error(err);
          reject(err);
        } else {
          _resolve(!!_.filter(processList, proc => proc.name === name).length);
        }
      })
    })

    if (nameExist) {
      const err = serverMode ? 'Mock server is exist' : `Mock(${name}) is exist`;
      mockLogger.error(err);
      pm2.disconnect();
      return resolve();
    }

    detect(port).then(_port => {
      const args = serverMode ? [] : [file, name];
      
      pm2.start({
        name,
        script: serverMode ? `./dist/main.js` : `./dist/mockware/index.js`,
        max_restarts: 0,
        args,
        env: {
          PORT: _port
        },
      }, (err, processList) => {
        pm2.disconnect();

        if (err) {
          mockLogger.error(err);
          resolve(err);
        } else {
          resolve(processList);
        }
      });
    });
  }))
};

// pm2 list
export async function status(serverMode = false) {

  return await new Promise((resolve, reject) => pm2.connect(err => {
    if (err) {
      mockLogger.error(err);
    }

    pm2.list((err, processList: ProcessDescription[]) => {
      pm2.disconnect();

      if (err) {
        mockLogger.error(err);
        reject(err);
      } else {
        const res = processList.map((processDescription: ProcessDescription) => {
          const {pm_id, name, pid, monit, pm2_env} = processDescription;
          const {status, pm_uptime, restart_time, PORT} = pm2_env;
          return {
            pm_id, 
            name, 
            update_time: pm_uptime,
            restarts: restart_time,
            status,
            ...monit,
            pid,
            port: PORT
          }
        })

        if (!serverMode) {
          resolve(_.filter(res, proc => proc.name !== SERVER_NAME))
        } else {
          resolve(_.get(_.filter(res, proc => proc.name === SERVER_NAME), '[0]'));
        }
      
      }
    })
  }));
}

// stop mock by id or name
export async function stop(mockIdOrNames: any[]) {
  return await new Promise((resolve, reject) => pm2.connect(async function(err) {
    if (err) {
      mockLogger.error(err);
    }

    for (let i = 0; i < mockIdOrNames.length; i++) {
      await new Promise((_resolve) => {
        const symbol = mockIdOrNames[i];
        pm2.delete(symbol, (err, processList: any) => {
          if (err) {
            pm2.disconnect();
            mockLogger.error(err);
            resolve(false);      
          }
          _resolve();   
        });
      })
    }

    resolve(true);
    pm2.disconnect();
  }));
}

export async function restart(mockIdOrNames) {
  return await new Promise((resolve, reject) => pm2.connect(async function(err) {
    if (err) {
      mockLogger.error(err);
    }

    for (let i = 0; i < mockIdOrNames.length; i++) {
      await new Promise((_resolve) => {
        const symbol = mockIdOrNames[i];
        pm2.restart(symbol, (err, processList) => {
          if (err) {
            pm2.disconnect();
            mockLogger.error(err);
            return resolve(err);    
          }
          _resolve();   
        });
      })
    }

    resolve(true);
    pm2.disconnect();
  }));
}

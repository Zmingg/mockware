import * as pm2 from 'pm2';
import * as detect from 'detect-port';
import { ProcessDescription } from './pm2.dto';

const DEFAULT_MOCK_PORT = 3001;

// pm2: start a new mock server
export async function start(path, name) {
  return await new Promise((resolve, reject) => pm2.connect(err => {
    if (err) {
      console.error(err)
      process.exit(2)
    }

    detect(DEFAULT_MOCK_PORT).then(port => {
      // if (DEFAULT_MOCK_PORT == port) {
      //   console.log(`port: ${DEFAULT_MOCK_PORT} was not occupied`);
      // } else {
      //   console.log(`port: ${DEFAULT_MOCK_PORT} was occupied, try port: ${port}`);
      // } 

      pm2.start({
        name,
        script: 'src/mockware/mock.server.ts',
        args: [
          path,
          name
        ],
        env: {
          PORT: port
        }
      }, (err, processList) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(processList);
        }
        pm2.disconnect();
      });

    });
  }))
};

// pm2 list
export async function list() {
  return await new Promise((resolve, reject) => pm2.connect(err => {
    if (err) {
      console.error(err)
    }

    pm2.list((err, processList: ProcessDescription[]) => {
      if (err) {
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
        resolve(res);
        pm2.disconnect();
      }
    })
  }));
}

export async function stop(mockIdOrNames: any[]) {
  return await new Promise((resolve, reject) => pm2.connect(async function(err) {
    if (err) {
      console.error(err)
    }

    for (let i = 0; i < mockIdOrNames.length; i++) {
      await new Promise((_resolve) => {
        const symbol = mockIdOrNames[i];
        pm2.delete(symbol, (err, processList: any) => {
          if (err) {
            pm2.disconnect();
            return reject(err);      
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
      console.error(err)
    }

    for (let i = 0; i < mockIdOrNames.length; i++) {
      await new Promise((_resolve) => {
        const symbol = mockIdOrNames[i];
        pm2.restart(symbol, (err, processList) => {
          if (err) {
            pm2.disconnect();
            return reject(err);    
          }
          _resolve();   
        });
      })
    }

    resolve(true);
    pm2.disconnect();
  }));
}
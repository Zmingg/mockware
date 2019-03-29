import { Injectable } from '@nestjs/common';
import * as pm2 from 'pm2';
import * as detect from 'detect-port';
import { AnyARecord } from 'dns';

const DEFAULT_MOCK_PORT = 3001;

@Injectable()
export class AppService {

  async create(createMockDto: any) {
    const {uri, name} = createMockDto;
    return await new Promise((resolve, reject) => pm2.connect(err => {
      if (err) {
        console.error(err)
        process.exit(2)
      }

      detect(DEFAULT_MOCK_PORT).then(port => {
        if (DEFAULT_MOCK_PORT == port) {
          console.log(`port: ${DEFAULT_MOCK_PORT} was not occupied`);
        } else {
          console.log(`port: ${DEFAULT_MOCK_PORT} was occupied, try port: ${port}`);
        } 
  
        pm2.start({
          name,
          script: 'src/mockware/index.ts',
          args: [
            name,
            uri
          ],
          env: {
            PORT: port
          }
        }, (err, apps) => {
          pm2.disconnect();
          if (err) {
            console.log(err);
            reject(err);
          } else {
            resolve(apps);
          }
        });

      });
    })
    
  )}

  async stop(mockIdOrNames) {
    return await new Promise((resolve, reject) => pm2.connect(async function(err) {
      if (err) {
        console.error(err)
      }
      const res = [];

      for (let i = 0; i < mockIdOrNames.length; i++) {
        await new Promise((_resolve) => {
          const process = mockIdOrNames[i];
          console.log(process)
          pm2.delete(process, (err, processList) => {
            if (err) reject(err);
            pm2.disconnect();
            res.push(process); 
            _resolve();   
          });
        })
      }

      resolve(res);
    }));
  }

  async list() {
    return await new Promise((resolve, reject) => pm2.connect(function(err) {
      if (err) {
        console.error(err)
      }

      pm2.list((err, processList) => {
        if (err) reject(err);
        pm2.disconnect();
        resolve(processList);     
      });

    }));
  }

}

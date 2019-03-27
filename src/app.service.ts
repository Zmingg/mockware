import { Injectable } from '@nestjs/common';
import * as pm2 from 'pm2';
import * as detect from 'detect-port';

const DEFAULT_MOCK_PORT = 3001;

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

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
          exec_mode: 'fork',
          args: [
            uri, name
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
}

import { Injectable } from '@nestjs/common';
import { start, status, stop, restart } from '../mockware/mock.action';

const DEFAULT_MOCK_PORT = 3001;

@Injectable()
export class AppService {

  async create(createMockDto: any) {
    const {path, name, port = DEFAULT_MOCK_PORT} = createMockDto;
    return await start({path, name, port});
  }

  async stop(mockIdOrNames) {
    return await stop(mockIdOrNames);
  }

  async restart(mockIdOrNames) {
    return await restart(mockIdOrNames);
  }

  async status() {
    return await status();
  }

}

import { Injectable } from '@nestjs/common';
import { start, list, stop } from '../mockware/mock.action';

const DEFAULT_MOCK_PORT = 3001;

@Injectable()
export class AppService {

  async create(createMockDto: any) {
    const {path, name} = createMockDto;
    return await start(path, name);
  }

  async stop(mockIdOrNames) {
    return await stop(mockIdOrNames);
  }

  async list() {
    return await list();
  }

}

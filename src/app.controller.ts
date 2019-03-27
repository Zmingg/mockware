import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateMockDto } from './app.dto';

const yamlUrl = 'http://apispec.aecg.com.cn/console/view-schema?url=http%3A%2F%2Fapispec.aecg.com.cn%2Fschemas%2Fecgcloud%2Fdiagnosis.yaml';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  create(@Body() createMockDto: CreateMockDto) {
    return this.appService.create(createMockDto);
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

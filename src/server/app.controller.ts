import { Controller, Get, Post, Delete, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateMockDto } from './app.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  create(@Body() createMockDto: CreateMockDto) {
    return this.appService.create(createMockDto);
  }

  @Post('restart')
  restart(@Body() mockIdOrNames: [any]) {
    return this.appService.restart(mockIdOrNames);
  }

  @Delete()
  stop(@Body() mockIdOrNames: [any]) {
    return this.appService.stop(mockIdOrNames);
  }

  @Get()
  list() {
    return this.appService.status();
  }
}

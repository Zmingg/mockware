import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './response.interceptor';

const MOCK_SERVER_PORT = process.env.PORT || 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new ResponseInterceptor());
  await app.listen(MOCK_SERVER_PORT);
  console.log(`Mock server is running at ${MOCK_SERVER_PORT}`)
}

bootstrap();

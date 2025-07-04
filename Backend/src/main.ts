import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Enable CORS here
  app.enableCors({
    origin: 'http://localhost:3000', // where your frontend is running
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();

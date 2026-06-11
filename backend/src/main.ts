import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({
  origin: [
    'http://localhost:5173',
    'https://sport-booking-iota.vercel.app',
    'https://sport-booking-dx8jbjqoy-renats-projects-25da3b8d.vercel.app',
    process.env.FRONTEND_URL || 'http://localhost:5173',
  ],
  credentials: true,
})

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Server running on http://localhost:3000`);
}
bootstrap();
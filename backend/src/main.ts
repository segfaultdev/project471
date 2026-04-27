import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const envOrigins = [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_ORIGIN,
    process.env.VERCEL_FRONTEND_URL,
  ].filter(Boolean) as string[];

  const defaultOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:3000',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = [...defaultOrigins, ...envOrigins];
      if (allowed.includes(origin) || /\.vercel\.app$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  });

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.listen(process.env.PORT ?? 3000);

  console.log(
    `Application is running on: http://localhost:${process.env.PORT ?? 3000}`,
  );
}

bootstrap();

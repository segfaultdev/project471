import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { json, urlencoded } from 'express';
import { AppModule } from '../src/app.module';

const server = express();
let isBootstrapped = false;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  const envOrigins = [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_ORIGIN,
    process.env.VERCEL_FRONTEND_URL,
  ].filter(Boolean) as string[];

  const defaultOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, curl, etc.)
      if (!origin) return callback(null, true);
      // Allow any vercel.app subdomain + configured origins
      const allowed = [
        ...defaultOrigins,
        ...envOrigins,
      ];
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

  await app.init();
  isBootstrapped = true;
}

export default async function handler(req, res) {
  if (!isBootstrapped) {
    await bootstrap();
  }

  return server(req, res);
}

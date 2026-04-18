/**
 * main.ts - Application entry point
 * 
 * This file:
 * 1. Creates the NestJS application
 * 2. Configures global pipes and interceptors
 * 3. Starts the HTTP server
 * 
 * Global Configuration:
 * - ValidationPipe: Validates all DTOs automatically
 * - ClassSerializerInterceptor: Enables @Exclude decorator (hides password)
 */
import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  // Create NestJS application instance
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend requests
  // Allow requests from frontend running on port 5173 or 5174
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true,
  });

  // Enable global validation pipe
  // Automatically validates all incoming requests against DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist: true - Strip properties that don't have decorators
      // Prevents clients from sending extra fields
      whitelist: true,
      
      // forbidNonWhitelisted: true - Throw error if extra properties sent
      // Returns 400 Bad Request if unknown fields are present
      forbidNonWhitelisted: true,
      
      // transform: true - Automatically transform payloads to DTO instances
      // Converts plain JavaScript objects to class instances
      transform: true,
    }),
  );

  // Enable global serialization interceptor
  // This makes @Exclude decorator work (e.g., hiding password field)
  // Without this, password would still be returned in responses
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Start HTTP server on port from .env (default 3000)
  await app.listen(process.env.PORT ?? 3000);
  
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
}

// Start the application
bootstrap();

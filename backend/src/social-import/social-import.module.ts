import { Module } from '@nestjs/common';
import { SocialImportController } from './social-import.controller';
import { SocialImportService } from './social-import.service';

@Module({
  controllers: [SocialImportController],
  providers: [SocialImportService],
})
export class SocialImportModule {}

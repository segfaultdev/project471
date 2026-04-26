import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { SocialImportDto } from './dto/social-import.dto';
import { SocialImportService } from './social-import.service';

@Controller('api/import')
export class SocialImportController {
  constructor(private readonly socialImportService: SocialImportService) {}

  /**
   * Controlled MVP demo import. This only matches predefined demo data because
   * real Facebook/Instagram scraping is restricted and unreliable.
   */
  @Public()
  @Post('social-store')
  @HttpCode(200)
  importSocialStore(@Body() importDto: SocialImportDto) {
    return this.socialImportService.findStore(importDto.url);
  }

  /**
   * Controlled MVP demo import. This only matches predefined demo data because
   * real Facebook/Instagram scraping is restricted and unreliable.
   */
  @Public()
  @Post('social-product')
  @HttpCode(200)
  importSocialProduct(@Body() importDto: SocialImportDto) {
    return this.socialImportService.findProduct(importDto.url);
  }
}

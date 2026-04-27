import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { SocialImportDto } from './dto/social-import.dto';
import { SocialImportService } from './social-import.service';

@Controller('api/import')
export class SocialImportController {
  constructor(private readonly socialImportService: SocialImportService) {}

  @Public()
  @Post('social-store')
  @HttpCode(200)
  importSocialStore(@Body() importDto: SocialImportDto) {
    return this.socialImportService.findStore(importDto.url);
  }

  @Public()
  @Post('social-product')
  @HttpCode(200)
  importSocialProduct(@Body() importDto: SocialImportDto) {
    return this.socialImportService.findProduct(importDto.url);
  }
}

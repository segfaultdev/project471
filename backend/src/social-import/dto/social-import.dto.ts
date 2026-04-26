import { IsNotEmpty, IsString } from 'class-validator';

export class SocialImportDto {
  @IsString({ message: 'URL must be a string' })
  @IsNotEmpty({ message: 'URL is required' })
  url: string;
}

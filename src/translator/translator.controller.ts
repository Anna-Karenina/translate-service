import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TranslateInToFileDto } from './dto/translate-in-to-file.dto';
import { TranslatorService } from './translator.service';

@ApiTags('Translator')
@Controller('translator')
export class TranslatorController {
  constructor(private readonly translatorService: TranslatorService) {}
  @Post('')
  async translate(
    @Body(ValidationPipe) translateInToFileDto: TranslateInToFileDto,
  ): Promise<any> {
    return this.translatorService.translate(translateInToFileDto);
  }
}

import { Injectable } from '@nestjs/common';
import { TranslateInToFileDto } from './dto/translate-in-to-file.dto';

@Injectable()
export class TranslatorService {
  async translate(translateInToFileDto: TranslateInToFileDto): Promise<any> {
    // Сначала описать логику с файлами
    return await 'a';
  }
}

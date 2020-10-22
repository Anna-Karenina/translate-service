import { Module } from '@nestjs/common';
import { TranslatorService } from './translator.service';
import { TranslatorController } from './translator.controller';

@Module({
  providers: [TranslatorService],
  controllers: [TranslatorController],
})
export class TranslatorModule {}

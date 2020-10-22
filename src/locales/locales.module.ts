import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose/dist';
import { FileModule } from 'src/file/file.module';
import { FileService } from 'src/file/file.service';

import { LocalesController } from './locales.controller';
import { LocalesService } from './locales.service';
import { LocaleSchema } from './schema/locale.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Locale', schema: LocaleSchema }]),
    FileModule,
  ],
  controllers: [LocalesController],
  providers: [LocalesService, FileService],
  exports: [LocalesService],
})
export class LocalesModule {}

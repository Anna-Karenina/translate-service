import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose/dist';
import { FileModule } from 'src/file/file.module';
import { FileService } from 'src/file/file.service';
import { GitlabModule } from 'src/gitlab/gitlab.module';
import { KeysMetaShema } from 'src/keysmeta/schema/keysmeta.schema';

import { LocalesController } from './locales.controller';
import { LocalesService } from './locales.service';
import { LocaleSchema } from './schema/locale.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Locale', schema: LocaleSchema },
      { name: 'KeysMeta', schema: KeysMetaShema },
    ]),
    FileModule,
    GitlabModule,
  ],
  controllers: [LocalesController],
  providers: [LocalesService, FileService],
  exports: [LocalesService],
})
export class LocalesModule {}

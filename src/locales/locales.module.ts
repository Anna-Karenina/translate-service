import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose/dist';
import { FileModule } from 'src/file/file.module';
import { FileService } from 'src/file/file.service';
import { GitlabModule } from 'src/gitlab/gitlab.module';
import { KeySchema } from 'src/keysmeta/schema/key.schema';
import { KeysMetaShema } from 'src/keysmeta/schema/keysmeta.schema';
import { ProjectSchema } from 'src/keysmeta/schema/project.schema';

import { LocalesController } from './locales.controller';
import { LocalesService } from './locales.service';
import { LocaleSchema } from './schema/locale.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Locale', schema: LocaleSchema },
      { name: 'KeysMeta', schema: KeysMetaShema },
      { name: 'Project', schema: ProjectSchema },
      { name: 'Key', schema: KeySchema },
    ]),
    FileModule,
    GitlabModule,
  ],
  controllers: [LocalesController],
  providers: [LocalesService, FileService],
  exports: [LocalesService],
})
export class LocalesModule {}

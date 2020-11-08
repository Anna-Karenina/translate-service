import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GitlabModule } from 'src/gitlab/gitlab.module';
import { KeysMetaShema } from 'src/keysmeta/schema/keysmeta.schema';

import { FileService } from './file.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'KeysMeta', schema: KeysMetaShema }]),
    GitlabModule,
  ],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}

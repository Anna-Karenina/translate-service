import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GitlabModule } from 'src/gitlab/gitlab.module';
import { KeysMetaShema } from 'src/keysmeta/schema/keysmeta.schema';

import { FileService } from './file.service';
import { FileController } from './file.controller';
import { ProjectSchema } from 'src/keysmeta/schema/project.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'KeysMeta', schema: KeysMetaShema },
      { name: 'Project', schema: ProjectSchema },
    ]),
    GitlabModule,
  ],
  providers: [FileService],
  exports: [FileService],
  controllers: [FileController],
})
export class FileModule {}

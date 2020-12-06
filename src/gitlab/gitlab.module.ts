import { HttpModule, Module } from '@nestjs/common';
import { GitlabService } from './gitlab.service';
import { GitlabController } from './gitlab.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectSchema } from 'src/keysmeta/schema/project.schema';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
    MongooseModule.forFeature([{ name: 'Project', schema: ProjectSchema }]),
  ],
  providers: [GitlabService],
  controllers: [GitlabController],
  exports: [GitlabService],
})
export class GitlabModule {}

import { HttpModule, Module } from '@nestjs/common';
import { GitlabService } from './gitlab.service';
import { GitlabController } from './gitlab.controller';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
  ],
  providers: [GitlabService],
  controllers: [GitlabController],
  exports: [GitlabService],
})
export class GitlabModule {}

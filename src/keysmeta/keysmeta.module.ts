import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FileModule } from 'src/file/file.module';
import { GitlabModule } from 'src/gitlab/gitlab.module';
import { LocalesModule } from 'src/locales/locales.module';

import { KeysmetaController } from './keysmeta.controller';
import { KeysmetaService } from './keysmeta.service';
import { KeySchema, KeysMetaShema } from './schema/keysmeta.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'KeysMeta', schema: KeysMetaShema },
      { name: 'Key', schema: KeySchema },
    ]),
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
    GitlabModule,
    LocalesModule,
    FileModule,
  ],
  controllers: [KeysmetaController],
  providers: [KeysmetaService],
  exports: [KeysmetaService],
})
export class KeysmetaModule {}

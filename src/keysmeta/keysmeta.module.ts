import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GitlabModule } from 'src/gitlab/gitlab.module';
import { LocalesModule } from 'src/locales/locales.module';

import { KeysmetaController } from './keysmeta.controller';
import { KeysmetaService } from './keysmeta.service';
import { KeysMetaShema } from './schema/keysmeta.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'KeysMeta', schema: KeysMetaShema }]),
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
    GitlabModule,
    LocalesModule,
  ],
  controllers: [KeysmetaController],
  providers: [KeysmetaService],
  exports: [KeysmetaService],
})
export class KeysmetaModule {}

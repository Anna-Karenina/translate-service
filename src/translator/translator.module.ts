import { HttpModule, Module } from '@nestjs/common';
import { TranslatorService } from './translator.service';
import { TranslatorController } from './translator.controller';
import { KeysmetaModule } from 'src/keysmeta/keysmeta.module';
import { FileModule } from 'src/file/file.module';
import { LocalesModule } from 'src/locales/locales.module';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
    KeysmetaModule,
    FileModule,
    LocalesModule,
  ],
  providers: [TranslatorService],
  controllers: [TranslatorController],
})
export class TranslatorModule {}

import { HttpModule, Module } from '@nestjs/common';
import { TranslatorService } from './translator.service';
import { TranslatorController } from './translator.controller';
import { KeysmetaModule } from 'src/keysmeta/keysmeta.module';
import { FileModule } from 'src/file/file.module';
import { LocalesModule } from 'src/locales/locales.module';
import { MongooseModule } from '@nestjs/mongoose';
import { KeySchema } from 'src/keysmeta/schema/key.schema';
import { ServiceProviderModule } from 'src/service-provider/service-provider.module';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
    MongooseModule.forFeature([{ name: 'Key', schema: KeySchema }]),
    KeysmetaModule,
    FileModule,
    LocalesModule,
    ServiceProviderModule,
  ],
  providers: [TranslatorService],
  controllers: [TranslatorController],
})
export class TranslatorModule {}

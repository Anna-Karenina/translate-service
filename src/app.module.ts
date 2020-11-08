import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configModule } from './configure.root';
import { LocalesModule } from './locales/locales.module';
import { GitlabModule } from './gitlab/gitlab.module';
import { KeysmetaModule } from './keysmeta/keysmeta.module';
import { TranslatorModule } from './translator/translator.module';
import { FileModule } from './file/file.module';

@Module({
  imports: [
    configModule,
    MongooseModule.forRoot(process.env.MONGO_WRITE_CONNECTION, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    }),
    KeysmetaModule,
    LocalesModule,
    GitlabModule,
    TranslatorModule,
    FileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

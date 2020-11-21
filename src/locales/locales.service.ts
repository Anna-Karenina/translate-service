/* eslint-disable @typescript-eslint/ban-ts-comment */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateLocaleDto } from './dto/create-locale.dto';
import { ILocale } from './interfaces/locale.interface';
import { Model } from 'mongoose';
import { DeleteLocaleDto } from './dto/delete-locale.dto';
import { GetLocaleDto } from './dto/get-locale-by-name.dto';
import { FileService } from 'src/file/file.service';
import { IKeysMeta } from 'src/keysmeta/interfaces/keysmeta.interface';
import { INotifications } from 'src/global-interfaces/notifications.interface';
import { IProject } from 'src/keysmeta/interfaces/project.interface';

@Injectable()
export class LocalesService {
  constructor(
    @InjectModel('Locale') readonly localeModel: Model<ILocale>,
    @InjectModel('KeysMeta') private readonly keysMetaModel: Model<IKeysMeta>,
    @InjectModel('Project') private readonly projectModel: Model<IProject>,

    private readonly fileService: FileService,
  ) {}

  // async checkExistkeyMeta(): Promise<boolean> {
  //   return await this.keysMetaModel.exists({});
  // }

  async updateProject(
    locale: string,
    project: string,
  ): Promise<boolean | INotifications> {
    await this.projectModel.findOne(
      { projectName: project },
      async (error, p) => {
        if (error) {
          return {
            status: 0,
            message: `Project ${project}does not exist`,
          };
        } else {
          //@ts-ignore
          p.usedLocales = [...p.usedLocales, locale];
          await p.save();
        }
      },
    );
    // return await this.localeModel.exists({ name: locale });
    return true;
  }

  async create(
    createLocaleDto: CreateLocaleDto,
  ): Promise<ILocale | INotifications> {
    const { name, project } = createLocaleDto;
    await this.updateProject(name, project);
  }

  async getAll(): Promise<ILocale[]> {
    const locales = await this.localeModel.find();
    return locales;
  }

  async getLocaleByName(getLocaleDto: GetLocaleDto): Promise<ILocale> {
    const locale = await this.localeModel.findOne(getLocaleDto);
    if (locale) {
      return locale;
    }
    throw new BadRequestException(`${getLocaleDto.name} does not find`);
    // TODO Обработку ошибки
  }

  async delete(deleteLocaleDto: DeleteLocaleDto): Promise<boolean> {
    await this.localeModel.findOneAndDelete(deleteLocaleDto);
    return true;
  }
}

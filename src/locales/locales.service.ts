/* eslint-disable @typescript-eslint/ban-ts-comment */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateLocaleDto } from './dto/create-locale.dto';
import { ILocale } from './interfaces/locale.interface';
import { Model } from 'mongoose';
import { DeleteLocaleDto } from './dto/delete-locale.dto';
import { GetLocaleDto } from './dto/get-locale-by-name.dto';
import { FileService } from 'src/file/file.service';
import { INotifications } from 'src/global-interfaces/notifications.interface';
import { IProject } from 'src/keysmeta/interfaces/project.interface';
import { IKey } from 'src/keysmeta/interfaces/key.interfaces';

@Injectable()
export class LocalesService {
  constructor(
    @InjectModel('Locale') readonly localeModel: Model<ILocale>,
    @InjectModel('Project') private readonly projectModel: Model<IProject>,
    @InjectModel('Key') private readonly key: Model<IKey>,
    private readonly fileService: FileService,
  ) {}

  async checkLocaleExist(lang: string) {
    return await this.localeModel.exists({ name: lang });
  }

  async updateProjectKeys({
    name,
    ids = [],
    truthful = false,
  }): Promise<INotifications | boolean> {
    const emptyTranslatedInToField = {
      lang: name,
      translator: { name: 'default', role: 'locale create' },
      translate: '',
      truthful: truthful,
    };
    await this.key.updateMany(ids.length ? { _id: ids } : {}, {
      $push: { translatedInTo: emptyTranslatedInToField },
    });
    return true;
  }

  async updateProject(
    locale: string,
    project: string,
  ): Promise<boolean | INotifications> {
    await this.projectModel.findById({ _id: project }, (error, p) => {
      if (error) {
        return {
          status: 0,
          message: `Project ${project}does not exist`,
        };
      } else {
        p.usedLocales.push(locale);
        p.save();
      }
    });
    return true;
  }

  async create(
    createLocaleDto: CreateLocaleDto,
  ): Promise<ILocale | INotifications> {
    const { name, project } = createLocaleDto;
    try {
      await this.projectModel.exists({ _id: project });
    } catch (error) {
      return {
        status: 0,
        message: 'Project doest not exist or wrong project id',
      };
    }

    const createLocale = async () => {
      await this.updateProject(name, project);
      await this.updateProjectKeys({ name });
      const newLocale = new this.localeModel(createLocaleDto);
      return newLocale.save();
    };

    const maybeExist = this.checkLocaleExist(name);
    return maybeExist
      ? await createLocale()
      : { status: 1, message: 'Locale allready exist' };
  }

  async createDefault(
    createLocaleDto: CreateLocaleDto,
  ): Promise<ILocale | INotifications> {
    const { name, project } = createLocaleDto;
    const createLocale = async () => {
      await this.updateProject(name, project);
      const newLocale = new this.localeModel(createLocaleDto);
      return newLocale.save();
    };

    const maybeExist = this.checkLocaleExist(name);
    return maybeExist
      ? await createLocale()
      : { status: 1, message: 'Locale allready exist' };
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
    const { project, name } = deleteLocaleDto;
    await this.localeModel.findOneAndDelete(deleteLocaleDto);
    await this.key.updateMany(
      {},
      { $pull: { translatedInTo: { lang: deleteLocaleDto.name } } },
      { safe: true },
    );
    await this.projectModel.findByIdAndUpdate(
      { _id: project },
      { $pull: { usedLocales: deleteLocaleDto.name } },
    );
    return true;
  }
}

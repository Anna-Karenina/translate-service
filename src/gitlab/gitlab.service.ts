import { HttpService, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { map } from 'rxjs/operators';
// import { BuildKeysDto } from 'src/keysmeta/dto/keysmeta.dto';
import { SendFileToRepositoryDto } from './dto/send-file-to-repo.dto';
import { readFileSync } from 'fs';
import { join, resolve } from 'path';
import { IProject } from 'src/keysmeta/interfaces/project.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LangException } from 'src/utils/Errors';

@Injectable()
export class GitlabService {
  constructor(
    private httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectModel('Project')
    private readonly projectModel: Model<IProject>,
  ) {}

  async getMainLocaleFileFromGitLab({ linkToRepo }): Promise<any> {
    const token = this.configService.get<string>('GIT_LAB_TOKEN');
    // const url = this.configService.get<string>('GIT_URL');
    const url = linkToRepo;
    const headersRequest = {
      'PRIVATE-TOKEN': token,
    };
    const fileFromGitLabBranch: Promise<string> = await this.httpService
      .get(url, { headers: headersRequest })
      .pipe(map(response => response.data))
      .toPromise();

    // TODO  Обработать ошибку
    return await fileFromGitLabBranch;
  }

  async pushCommit(
    sendFileToRepositoryDto: SendFileToRepositoryDto,
  ): Promise<any> {
    const { consumer, lang, project } = sendFileToRepositoryDto;
    const token = this.configService.get<string>('GIT_URL_FOR_COMMIT_TOKEN');
    const url = this.configService.get<string>('GIT_URL_FOR_COMMIT');

    const filledProject: IProject[] = await this.getFilledProject({
      project,
      consumer,
    });

    if (!filledProject[0].usedLocales.includes(lang)) {
      const error = { lang, project };
      throw new LangException(error);
    }

    console.log(filledProject);

    const headersRequest = {
      'PRIVATE-TOKEN': token,
    };
    const actions = [
      // {
      //   action: 'delete',
      //   file_path: 'tr/rus.js',
      // },
      {
        action: 'create',
        file_path: 'tr/ru.js',
        content: readFileSync(join(resolve(), '/locales/bbo/ru.js')).toString(
          'base64',
        ),
        encoding: 'base64',
      },
      // {
      //   action: 'update',
      //   file_path: 'src/ru.js',

      //   content:
      // },
    ];
    // console.log(actions);
    const payload = {
      branch: 'master',
      commit_message: 'message',
      actions,
    };
    // try {
    //   const a = await this.httpService
    //     .post(url, payload, { headers: headersRequest })
    //     .pipe(map(async response => await response.data))
    //     .toPromise();
    //   console.log(a);
    // } catch (error) {
    //   console.log(error);
    // }

    return 'bla';
  }

  async getFilledProject({ project, consumer }): Promise<IProject[]> {
    const curentProjects = await this.projectModel
      .find({
        projectName: project,
      })
      .exec();
    if (!consumer) return curentProjects;

    const filtered = [];
    curentProjects.forEach((cp: IProject) => {
      const findedConsumers = cp.consumers.find(
        c => c.consumerType === consumer,
      );
      if (!findedConsumers) return;
      //@ts-ignores
      const filteredConsumers = { ...cp._doc, consumers: [findedConsumers] };
      filtered.push(filteredConsumers);
    });
    return filtered;
  }
}

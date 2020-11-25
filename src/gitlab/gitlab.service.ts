import { HttpService, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { map } from 'rxjs/operators';
import { BuildKeysDto } from 'src/keysmeta/dto/keysmeta.dto';

@Injectable()
export class GitlabService {
  constructor(
    private httpService: HttpService,
    private readonly configService: ConfigService,
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
}

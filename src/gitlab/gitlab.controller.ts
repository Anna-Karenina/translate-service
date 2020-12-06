import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SendFileToRepositoryDto } from './dto/send-file-to-repo.dto';
import { GitlabService } from './gitlab.service';
import * as mongoose from 'mongoose';
import { LangException } from 'src/utils/Errors';

@ApiTags('Storage')
@Controller('gitlab')
export class GitlabController {
  constructor(private readonly gitlabService: GitlabService) {}

  @Post('file-to-repo')
  async pushCommit(
    @Body(ValidationPipe) sendFileToRepositoryDto: SendFileToRepositoryDto,
  ): Promise<any> {
    try {
      const response = await this.gitlabService.pushCommit(
        sendFileToRepositoryDto,
      );
      return response;
    } catch (error) {
      if (error instanceof LangException) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            error: error.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }
}

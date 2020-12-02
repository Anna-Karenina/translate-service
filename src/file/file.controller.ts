import { Controller, Get, Query, Res, ValidationPipe } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { GetFileDto } from './dto/get-file.dto';
import { FileService } from './file.service';

@ApiTags('File')
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get('/get-translated-file')
  async getFile(
    @Query(ValidationPipe) getFileDto: GetFileDto,
    @Res() res: Response,
  ): Promise<any> {
    const filePath: string = await this.fileService.buildFileByProjectName(
      getFileDto,
    );

    const headers = {
      'Content-Disposition': `attachment; filename="${getFileDto.lang}.js"`,
      'Content-Length': this.fileService.getFilesizeInBytes(filePath),
    };

    res.sendFile(filePath, { headers }, function(err) {
      if (err) {
        console.log('errrr:', err);
      } else {
        console.log('Sent:', filePath);
      }
    });
  }
}

import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import * as mongoose from 'mongoose';
import { ApiTags } from '@nestjs/swagger';
import { AddServiceDto } from './dto/add-service.dto';
import { GetServiceDto } from './dto/get-service.dto';
import { IServiceProvider } from './interfaces/service-provider.interface';
import { ServiceProviderService } from './service-provider.service';

@ApiTags('Service-Provider')
@Controller('service-provider')
export class ServiceProviderController {
  constructor(
    private readonly serviceProviderService: ServiceProviderService,
  ) {}

  @Get('/get-list')
  async getServiceList(): Promise<IServiceProvider[]> {
    try {
      const list = await this.serviceProviderService.getAll();
      return list;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: `Something goes wrong`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('/get-by-id')
  async getServiceById(
    @Query(ValidationPipe) query: GetServiceDto,
  ): Promise<IServiceProvider> {
    try {
      const serviceProvider = await this.serviceProviderService.getById(query);
      return serviceProvider;
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: `Service with ID: ${query.ID} does't exist`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  @Post('/add-service')
  async addService(
    @Body(ValidationPipe) addServiceDto: AddServiceDto,
  ): Promise<IServiceProvider> {
    try {
      const service = this.serviceProviderService.createService(addServiceDto);
      return service;
    } catch (error) {}
  }
}

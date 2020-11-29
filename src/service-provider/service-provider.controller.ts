import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AddServiceDto } from './dto/add-service.dto';
import { ServiceProviderService } from './service-provider.service';

@ApiTags('Service-Provider')
@Controller('service-provider')
export class ServiceProviderController {
  constructor(
    private readonly serviceProviderService: ServiceProviderService,
  ) {}

  @Post('/add-service')
  async addService(
    @Body(ValidationPipe) addServiceDto: AddServiceDto,
  ): Promise<any> {
    return this.serviceProviderService.createService(addServiceDto);
  }
}

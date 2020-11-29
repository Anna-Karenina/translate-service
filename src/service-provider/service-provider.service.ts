import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddServiceDto } from './dto/add-service.dto';
import { IServiceProvider } from './interfaces/service-provider.interface';

@Injectable()
export class ServiceProviderService {
  constructor(
    @InjectModel('ServiceProvider')
    private readonly serviceProviderModle: Model<IServiceProvider>,
  ) {}
  async createService(addServiceDto: AddServiceDto) {
    const {
      formatGroup,
      name,
      url,
      secretKeyExpireAt,
      secret_key,
    } = addServiceDto;
    const payload = {
      ...(formatGroup && { formatGroup }),
      ...(name && { name }),
      ...(url && { url }),
      ...(secretKeyExpireAt && { secretKeyExpireAt }),
      ...(secret_key && { secret_key }),
    };
    const newService = await new this.serviceProviderModle(payload).save();
    return newService;
  }
}

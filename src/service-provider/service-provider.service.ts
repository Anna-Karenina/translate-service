import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { INotifications } from 'src/global-interfaces/notifications.interface';
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
      secretKey,
    } = addServiceDto;
    const token = {
      ...(secretKeyExpireAt && { expireAt: secretKeyExpireAt }),
      ...(secretKey && { secretKey }),
    };
    const payload = {
      ...(formatGroup && { formatGroup }),
      ...(name && { name }),
      ...(url && { url }),
      ...(token && { token }),
    };
    const newService = await new this.serviceProviderModle(payload).save();
    return newService;
  }

  async getAll(): Promise<IServiceProvider[]> {
    const list: IServiceProvider[] = await this.serviceProviderModle.find({});
    return list;
  }

  async getById({ ID }): Promise<IServiceProvider> {
    const serviceProvider = await this.serviceProviderModle.findById(ID).exec();
    return serviceProvider;
  }
}

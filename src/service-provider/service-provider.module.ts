import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServiceProviderSchema } from './schema/service-provider.schema';
import { ServiceProviderService } from './service-provider.service';
import { ServiceProviderController } from './service-provider.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'ServiceProvider', schema: ServiceProviderSchema },
    ]),
  ],
  providers: [ServiceProviderService],
  controllers: [ServiceProviderController],
  exports: [ServiceProviderService],
})
export class ServiceProviderModule {}

import { DynamicModule, Module, Provider } from '@nestjs/common';
import { SMS_OPTIONS } from './constants';
import { SmsModuleAsyncOptions, SmsModuleOptions } from './interfaces';
import { SmsService } from './services';

@Module({})
export class SmsModule {
  static forRoot(options: SmsModuleOptions): DynamicModule {
    const providers: Provider[] = [
      {
        provide: SMS_OPTIONS,
        useValue: options,
      },
      SmsService,
    ];

    return {
      module: SmsModule,
      global: options.isGlobal ?? false,
      providers,
      exports: [SmsService],
    };
  }

  static forRootAsync(options: SmsModuleAsyncOptions): DynamicModule {
    const providers: Provider[] = [
      {
        provide: SMS_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      },
      SmsService,
    ];

    return {
      module: SmsModule,
      global: options.isGlobal ?? false,
      providers,
      exports: [SmsService],
    };
  }
}

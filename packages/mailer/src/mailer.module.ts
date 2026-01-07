import { DynamicModule, Module, Provider } from '@nestjs/common';
import { MAILER_OPTIONS } from './constants';
import { MailerModuleAsyncOptions, MailerModuleOptions } from './interfaces';
import { MailerService } from './services';

@Module({})
export class MailerModule {
  static forRoot(options: MailerModuleOptions): DynamicModule {
    const providers: Provider[] = [
      {
        provide: MAILER_OPTIONS,
        useValue: options,
      },
      MailerService,
    ];

    return {
      module: MailerModule,
      global: options.isGlobal ?? false,
      providers,
      exports: [MailerService],
    };
  }

  static forRootAsync(options: MailerModuleAsyncOptions): DynamicModule {
    const providers: Provider[] = [
      {
        provide: MAILER_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      },
      MailerService,
    ];

    return {
      module: MailerModule,
      global: options.isGlobal ?? false,
      providers,
      exports: [MailerService],
    };
  }
}

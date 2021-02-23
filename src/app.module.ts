import { User } from './models/user.model';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { AuthGuard } from './guards/auth.guard';
import { AssetsController } from './controllers/assets.controller';
import { Module } from '@nestjs/common';
import { AssetsService } from './services/assets.service';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ConfigController } from './controllers/config.controller';
import { ConfigService } from './services/config.service';
import { EthereumService } from './services/ethereum.service';
import { Order } from './models/order.model';
import { AdminService } from './services/admin.service';
import { AdminController } from './controllers/admin.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './services/email.service';
import { PasswordReset } from './models/password.reset.model';
import { Asset } from './models/asset.model';
import { ImageService } from './services/image.service';
import { ProvidusBankService } from './services/providus-bank.service';
import { OrdersService } from './services/orders.service';
import { UserAssets } from './models/user.assets.model';
import { SmsService } from './services/sms.service';
import { FeesService } from './services/fees.service';
import { Fees } from './models/fees.model';
import { FeesController } from './controllers/fees.controller';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    TypeOrmModule.forRoot(),
    TypeOrmModule.forFeature([User, Asset, Order, PasswordReset, UserAssets, Fees]),
    MailerModule.forRoot({  
      transport: process.env.EMAIL_URL,
      defaults: {
        from: process.env.EMAIL_FROM,
      },
    }), 
  ],
  controllers: [
    AssetsController,
    UserController,
    ConfigController,
    AdminController,
    FeesController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    },
    AssetsService,
    UserService,
    ConfigService,
    EthereumService,
    AdminService,
    EmailService,
    ImageService,
    ProvidusBankService,
    OrdersService,
    SmsService,
    FeesService,
  ],
})
export class AppModule { }

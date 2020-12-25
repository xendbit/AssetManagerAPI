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
import { TokenShares } from './models/token.shares.model';
import { ConfigController } from './controllers/config.controller';
import { ConfigService } from './services/config.service';
import { EthereumService } from './services/ethereum.service';
import { Order } from './models/order.model';
import { AdminService } from './services/admin.service';
import { Admin } from './models/admin.model';
import { AdminController } from './controllers/admin.controller';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    TypeOrmModule.forRoot(),
    TypeOrmModule.forFeature([User, TokenShares, Order, Admin]),
  ],
  controllers: [
    AssetsController,
    UserController,
    ConfigController,
    AdminController,
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
  ],
})
export class AppModule { }

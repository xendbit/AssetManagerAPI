"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const user_model_1 = require("./models/user.model");
const user_service_1 = require("./services/user.service");
const user_controller_1 = require("./controllers/user.controller");
const auth_guard_1 = require("./guards/auth.guard");
const assets_controller_1 = require("./controllers/assets.controller");
const common_1 = require("@nestjs/common");
const assets_service_1 = require("./services/assets.service");
const core_1 = require("@nestjs/core");
const typeorm_1 = require("@nestjs/typeorm");
let AppModule = class AppModule {
};
AppModule = __decorate([
    common_1.Module({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'sqlite',
                database: 'AssetManager.db',
                entities: [__dirname + '/**/*.model{.ts,.js}'],
                synchronize: true,
            }),
            typeorm_1.TypeOrmModule.forFeature([user_model_1.User]),
        ],
        controllers: [
            assets_controller_1.AssetsController,
            user_controller_1.UserController,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: auth_guard_1.AuthGuard
            },
            assets_service_1.AssetsService,
            user_service_1.UserService,
        ],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exceptions_filter_1 = require("./filters/exceptions.filter");
const logger_interceptor_1 = require("./interceptors/logger.interceptor");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalInterceptors(new logger_interceptor_1.LoggerInterceptor());
    app.useGlobalPipes(new common_1.ValidationPipe());
    app.useGlobalFilters(new exceptions_filter_1.ExceptionsFilter());
    const options = new swagger_1.DocumentBuilder()
        .setTitle('Asset Manager API')
        .setDescription('API endpoints for Xend Assset Management and Order Matching Platform')
        .setVersion('1.0.0')
        .addTag('asset-manager')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, options);
    swagger_1.SwaggerModule.setup('api', app, document);
    await app.listen(8181);
}
bootstrap();
//# sourceMappingURL=main.js.map
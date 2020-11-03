import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
export declare class ExceptionsFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost): void;
}

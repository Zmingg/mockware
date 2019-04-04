import { AppService } from './app.service';
import { CreateMockDto } from './app.dto';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    create(createMockDto: CreateMockDto): Promise<{}>;
    restart(mockIdOrNames: [any]): Promise<{}>;
    stop(mockIdOrNames: [any]): Promise<{}>;
    list(): Promise<{}>;
}

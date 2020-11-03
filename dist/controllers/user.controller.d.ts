import { UserService } from './../services/user.service';
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    getNewAddress(id: number): Promise<any>;
}

import { FindUserType } from '../type/usersTypes';


declare global {
    declare namespace Express {
        export interface Request {
            requestUser: FindUserType | null
        }
    }
}
import { UserDocument } from "./type/users.schema";


declare global {
    declare namespace Express {
        export interface Request {
            requestUser: UserDocument | null
        }
    }
}
import { UserDocument } from "../domain/entities/users.schema";


declare global {
    declare namespace Express {
        export interface Request {
            requestUser: UserDocument | null
        }
    }
}
import { UserDocument } from "./users.schema";


declare global {
    declare namespace Express {
        export interface Request {
            user: UserDocument | null
        }
    }
}
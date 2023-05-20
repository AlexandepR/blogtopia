import { User, UserDocument } from "./users.schema";


declare global {
    declare namespace Express {
        export interface Request {
            user: UserDocument | null
            // getRefreshToken: string | null
            // userAgent?: string | null
        }
    }
}
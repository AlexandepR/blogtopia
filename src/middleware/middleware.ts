import { UsersService } from "../modules/users/application/users.service";
import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";
import { UsersRepository } from "../modules/users/infrastructure/users.repository";
import { UsersSqlRepository } from '../modules/users/infrastructure/users.sql-repository';

// @Injectable()
// export class EmailConfirmMiddleware implements NestMiddleware {
//   constructor(private usersService: UsersService) {}
//
//   async use(req: Request, res: Response, next: NextFunction) {
//     const email = req.body.email;
//     const user = await this.usersService.findUserByLoginOrEmail(email);
//
//     if (user.emailConfirmation.isConfirmed === true) {
//       throw new HttpException('', HttpStatus.FORBIDDEN);
//     }
//     next();
//   }
// }

@Injectable()
export class EmailConfirmGuard implements CanActivate {
  constructor(private usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const email = req.body.email;
    const user = await this.usersService.findUserByLoginOrEmail(email);
    if(!user) return true
    if (user.emailConfirmation.isConfirmed === true || user) {
      throw new HttpException('', HttpStatus.FORBIDDEN);
    }
    return true;
  }
}



@Injectable()
export class CheckLoginOrEmailGuard implements CanActivate {
  constructor(private usersService: UsersService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const login = req.body.login;
    const email = req.body.email;
    if (email || login) {
      const findUserEmail = await this.usersService.findUserByLoginOrEmail(email);
      const findUserLogin = await this.usersService.findUserByLoginOrEmail(login);
      if (findUserEmail || findUserLogin) {
        throw new HttpException('', HttpStatus.FORBIDDEN);
      }
    }
    return true
  }
}

// @Injectable()
// export class AttemptControlMiddleware implements NestMiddleware{
//   constructor(
//     protected attempt: number,
//     protected limitTime: number,
//     // protected attemptsRepository: AttemptRepository
//     ) {}
//
//   async use(req: Request, res: Response, next: NextFunction) {
//     // const ip = req.ip
//     // const url = req.url
//     // const currentTime = new Date()
//     // const attemptsTime = new Date(currentTime.getTime() - this.limitTime)
//     // await this.attemptsRepository.deleteOldAttempt(attemptsTime)
//     // const attempts = await this.attemptsRepository.getAttempts(ip, url)
//     // const findAttempt = attempts.find((attempt) => {
//     //   return attempt.ip === ip && attempt.url === url
//     // })
//     // if (findAttempt) {
//     //   if (attempts.length >= this.attempt) {
//     //     return res.sendStatus(429)
//     //   }
//     // }
//     // await this.attemptsRepository.addAttempt(ip, url, currentTime)
//     next()
//   }
// }

@Injectable()
export class recoveryCodeGuard implements CanActivate{
  constructor(
    protected usersSqlRepository: UsersSqlRepository
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean>{
    const req = context.switchToHttp().getRequest()
    const recoveryCode = req.body.recoveryCode
      const checkCode = await this.usersSqlRepository.checkRecoveryCode(recoveryCode);
      if (!checkCode || recoveryCode === '') {
        throw new HttpException('', HttpStatus.FORBIDDEN);
      }
      return true
    }
}



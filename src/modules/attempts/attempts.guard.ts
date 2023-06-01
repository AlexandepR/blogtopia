// import {
//   CanActivate,
//   ExecutionContext,
//   HttpCode,
//   HttpException,
//   HttpStatus, Injectable, mixin,
//   UnauthorizedException
// } from "@nestjs/common";
// import { AttemptRepository } from "./attempt.repository";
//
// export const AttemptsGuard = (attempt: number, limitTime: number,) => {
//     const guard = mixin(AttemptsGuard1);
//   return guard;
// }
//
// @Injectable()
// export class AttemptsGuard1 implements CanActivate {
//
//
//
//   constructor(
//     protected attempt: number,
//    protected limitTime: number,
//     protected attemptsRepository: AttemptRepository
//   ) {}
//
//   async canActivate(context: ExecutionContext): Promise<boolean>{
//     const req = context.switchToHttp().getRequest()
//     const ip = req.ip
//     const url = req.url
//     const currentTime = new Date()
//     const attemptsTime = new Date(currentTime.getTime() - this.limitTime)
//     await this.attemptsRepository.deleteOldAttempt(attemptsTime)
//     const attempts = await this.attemptsRepository.getAttempts(ip, url)
//     const findAttempt = attempts.find((attempt) => {
//       return attempt.ip === ip && attempt.url === url
//     })
//     if (findAttempt) {
//       if (attempts.length >= this.attempt) {
//        throw new HttpException('', HttpStatus.TOO_MANY_REQUESTS)
//       }
//       return true
//     }
//     await this.attemptsRepository.addAttempt(ip, url, currentTime)
//   }
// }
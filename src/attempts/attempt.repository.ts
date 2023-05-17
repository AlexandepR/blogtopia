import { Injectable } from "@nestjs/common";
import { Attempt, AttemptModelType } from "./attempts.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Injectable()
export class AttemptRepository {
  constructor(
    @InjectModel(Attempt.name)private AttemptModel: AttemptModelType) {}

  async addAttempt(ip: string, url: string, time: Date): Promise<Types.ObjectId | null> {
    const attempt = Attempt.createAttempt(ip, url, time)
    await this.AttemptModel.insertMany([attempt]);
    return attempt._id;
  }
  async getAttempts(ip: string, url: string): Promise<{ip: string, url: string}[]> {
    return this.AttemptModel
      .find({ ip: ip, url: url })
  }
  async deleteOldAttempt(attemptsTime: Date) {
    const result = await this.AttemptModel
      .deleteMany({ time: { $lt: new Date(attemptsTime) }})
      .exec();
    return result.deletedCount >= 1;
  }

}
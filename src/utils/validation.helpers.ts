import { IsMongoId, validateOrReject } from "class-validator";
import { ExecutionContext, Injectable, NotFoundException, PipeTransform } from "@nestjs/common";
import { Types } from "mongoose";

export const validateOrRejectModel = async ( model: any, ctor: { new(): any}) => {
  if (!(model instanceof ctor)) {
    throw new Error('Incorrect input data')
  }
  try{
    await validateOrReject(model)
  } catch (error) {
    throw new Error(error)
  }
}
/*
* **check id, is not ObjectId, return error
* */
export class checkObjectId {
  @IsMongoId({message: 'Invalid Id format'})
  id:string;
}

class CheckObjectIdPipe implements PipeTransform {
  transform(value: any) {
    if (!Types.ObjectId.isValid(value)) {
      throw new NotFoundException()
    }
    return value
  }
}
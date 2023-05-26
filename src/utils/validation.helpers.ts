import { IsMongoId, validateOrReject } from "class-validator";
import { ExecutionContext, Injectable } from "@nestjs/common";

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

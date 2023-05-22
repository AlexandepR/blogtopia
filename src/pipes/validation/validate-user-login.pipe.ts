import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from "class-validator";
import { UsersRepository } from "../../users/users.repository";
import { NotFoundException } from "@nestjs/common";

@ValidatorConstraint({ name: "IsLoginOrEmailAlreadyExistsPipe", async: true })
export class IsLoginOrEmailAlreadyExistsPipe implements ValidatorConstraintInterface {
  constructor(protected usersRepository: UsersRepository) {
  }
  async validate(loginOrEmail: string, args: ValidationArguments) {
    try {
      const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);
      if (user) return false
        // new NotFoundException();
      return true;
    } catch (e) {
      return false
      // throw new NotFoundException();
    }

  }
  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return "User with this login or email already exists";
  }
}
export function IsLoginOrEmailAlreadyExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsLoginOrEmailAlreadyExistsPipe',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsLoginOrEmailAlreadyExistsPipe,
    });
  };
}


@ValidatorConstraint({ name: "IsLoginOrEmailNotExistsPipe", async: true })
export class IsLoginOrEmailNotExistsPipe implements ValidatorConstraintInterface {
  constructor(protected usersRepository: UsersRepository) {
  }
  async validate(loginOrEmail: string, args: ValidationArguments) {
    try {
      const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);
      if (!user) return false
      // new NotFoundException();
      return true;
    } catch (e) {
      return false
      // throw new NotFoundException();
    }

  }
  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return "User with this login or email doesnt exists";
  }
}
export function IsLoginOrEmailNotExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsLoginOrEmailNotExistsPipe',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsLoginOrEmailNotExistsPipe,
    });
  };
}
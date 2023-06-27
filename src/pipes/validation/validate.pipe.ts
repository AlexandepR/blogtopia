import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';
import { BlogsRepository } from '../../modules/blogs/infrastructure/blogs.repository';
import { Types } from 'mongoose';
import { BlogsQueryRepository } from '../../modules/blogs/infrastructure/blogs.query-repository';
import { UsersSqlRepository } from '../../modules/users/infrastructure/users.sql-repository';


@ValidatorConstraint({ name: "IsLoginOrEmailNotExistsPipe", async: true })
export class IsLoginOrEmailNotExistsPipe implements ValidatorConstraintInterface {
  constructor(protected usersSqlRepository: UsersSqlRepository) {
  }
  async validate(email: string, args: ValidationArguments) {
    try {
      const user = await this.usersSqlRepository.findByLoginOrEmail(email);
      if (!user || user.isConfirmed === true) return false;
      return true;
    } catch (e) {
      return false;
    }

  }
  defaultMessage(args: ValidationArguments) {
    return "User with this email doesnt exists or already confirmed";
  }
}

export function IsLoginOrEmailNotExists(validationOptions?: ValidationOptions) {
  return function(object: Object, propertyName: string) {
    registerDecorator({
      name: "IsLoginOrEmailNotExists",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsLoginOrEmailNotExistsPipe
    });
  };
}


@ValidatorConstraint({ name: "CheckConfirmDataPipe", async: true })
export class CheckConfirmDataPipe implements ValidatorConstraintInterface {
  constructor(protected usersSqlRepository: UsersSqlRepository) {
  }
  async validate(data: string, args: ValidationArguments) {
    const { property } = args;
    if (property === "email" || property === "login") {
      try {
        const user = await this.usersSqlRepository.findByLoginOrEmail(data);
        if (user) return false;
        return true;
      } catch (e) {
        return false;
      }
    }
    if (property === "code") {
      try {
        const user = await this.usersSqlRepository.findByConfirmationCode(data);
        if (!user) return false;
        if (user.isConfirmed === true) return false;
        return true;
      } catch (e) {
        return false;
      }
    }
  }
  defaultMessage(args: ValidationArguments) {
    return "Invalid data";
  }
}

/*
* *Check email, login and confirm Code
* */
export function CheckConfirmData(validationOptions?: ValidationOptions) {
  return function(object: Object, propertyName: string) {
    registerDecorator({
      name: "CheckConfirmData",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: CheckConfirmDataPipe
    });
  };
}

@ValidatorConstraint({ name: "existingBlogPipe", async: true })
export class existingBlogPipe implements ValidatorConstraintInterface {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
  ) {}
  async validate(dto: string, args: ValidationArguments) {
    const findBlog = await this.blogsQueryRepository.findBlogById(new Types.ObjectId(dto));
    if(!findBlog) return false
    return true
  }
  defaultMessage(args: ValidationArguments) {
    const {property} = args
    return `blog doesn't exist`;
  }
}
export function existingBlog(validationOptions?: ValidationOptions) {
  return function(object: Object, propertyName: string) {
    registerDecorator({
      name: "existingBlog",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: existingBlogPipe
    });
  };
}
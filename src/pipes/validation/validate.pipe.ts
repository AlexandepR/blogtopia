import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from "class-validator";
import { UsersRepository } from "../../modules/users/application/users.repository";
import { NotFoundException } from "@nestjs/common";
import { BlogsRepository } from "../../modules/blogs/application/blogs.repository";
import { Types } from "mongoose";

// @ValidatorConstraint({ name: "IsLoginOrEmailAlreadyExistsPipe", async: true })
// export class IsLoginOrEmailAlreadyExistsPipe implements ValidatorConstraintInterface {
//   constructor(protected usersRepository: UsersRepository) {
//   }
//   async validate(loginOrEmail: string, args: ValidationArguments) {
//     try {
//       const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);
//       if (user) return false
//         // new NotFoundException();
//       return true;
//     } catch (e) {
//       return false
//       // throw new NotFoundException();
//     }
//
//   }
//   defaultMessage(args: ValidationArguments) {
//     // here you can provide default error message if validation failed
//     return "User with this login or email already exists";
//   }
// }
// export function IsLoginOrEmailAlreadyExists(validationOptions?: ValidationOptions) {
//   return function (object: Object, propertyName: string) {
//     registerDecorator({
//       name: 'IsLoginOrEmailAlreadyExistsPipe',
//       target: object.constructor,
//       propertyName: propertyName,
//       options: validationOptions,
//       validator: IsLoginOrEmailAlreadyExistsPipe,
//     });
//   };
// }

@ValidatorConstraint({ name: "IsLoginOrEmailNotExistsPipe", async: true })
export class IsLoginOrEmailNotExistsPipe implements ValidatorConstraintInterface {
  constructor(protected usersRepository: UsersRepository) {
  }
  async validate(email: string, args: ValidationArguments) {
    try {
      const user = await this.usersRepository.findByLoginOrEmail(email);
      if (!user || user.emailConfirmation.isConfirmed === true) return false;
      return true;
    } catch (e) {
      return false;
    }

  }
  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return "User with this email doesnt exists oe already confirmed";
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
  constructor(protected usersRepository: UsersRepository) {
  }
  async validate(data: string, args: ValidationArguments) {
    const { property } = args;
    if (property === "email" || property === "login") {
      try {
        const user = await this.usersRepository.findByLoginOrEmail(data);
        if (user) return false;
        return true;
      } catch (e) {
        return false;
      }
    }
    if (property === "code") {
      try {
        const user = await this.usersRepository.findByConfirmationCode(data);
        if (!user) return false;
        if (user.emailConfirmation.isConfirmed === true) return false;
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


// @ValidatorConstraint({ name: "validateInputBlogPipe", async: true })
// export class validateInputBlogPipe implements ValidatorConstraintInterface {
//   constructor() {}
//   async validate(dto: string, args: ValidationArguments) {
//     const {value} = args
//     if (!value || value.trim().length <= 0) return false
//     if( typeof value !== 'string') return false
//     return true
//   }
//   defaultMessage(args: ValidationArguments) {
//     const {property} = args
//     // here you can provide default error message if validation failed
//     return `${property} is empty`;
//   }
// }
// //   }
// //   async validate(dto: string, args: ValidationArguments) {
// //     const { value, property } = args;
// //     if (!value || value.trim().length <= 0) return false;
// //     if (typeof value !== "string") return false;
// //     if (property === "name") {
// //       if(value.trim().length > 15) return false
// //       return true
// //     }
// //     if (property === "description" && value.trim().length > 500) {
// //       if(value.trim().length > 500) return false
// //       return true
// //     }
// //     // if (property === "websiteUrl") {
// //     //
// //     // }
// //
// //
// //     return false;
// //   }
// //   defaultMessage(args: ValidationArguments) {
// //     const { property } = args;
// //     // here you can provide default error message if validation failed
// //     return `${property} is empty`;
// //   }
// // }
//
// export function ValidateInputBlog(validationOptions?: ValidationOptions) {
//   return function(object: Object, propertyName: string) {
//     registerDecorator({
//       name: "validateInputBlog",
//       target: object.constructor,
//       propertyName: propertyName,
//       options: validationOptions,
//       validator: validateInputBlogPipe
//     });
//   };
// }


@ValidatorConstraint({ name: "existingBlogPipe", async: true })
export class existingBlogPipe implements ValidatorConstraintInterface {
  constructor(
    protected blogsRepository: BlogsRepository
  ) {}
  async validate(dto: string, args: ValidationArguments) {
    const findBlog = await this.blogsRepository.findBlogById(new Types.ObjectId(dto));
    if(!findBlog) return false
    return true
  }
  defaultMessage(args: ValidationArguments) {
    const {property} = args
    // here you can provide default error message if validation failed
    return `blog doesn't exist`;
  }
}
//   }
//   async validate(dto: string, args: ValidationArguments) {
//     const { value, property } = args;
//     if (!value || value.trim().length <= 0) return false;
//     if (typeof value !== "string") return false;
//     if (property === "name") {
//       if(value.trim().length > 15) return false
//       return true
//     }
//     if (property === "description" && value.trim().length > 500) {
//       if(value.trim().length > 500) return false
//       return true
//     }
//     // if (property === "websiteUrl") {
//     //
//     // }
//
//
//     return false;
//   }
//   defaultMessage(args: ValidationArguments) {
//     const { property } = args;
//     // here you can provide default error message if validation failed
//     return `${property} is empty`;
//   }
// }

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
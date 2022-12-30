import { BadRequestException, HttpStatus } from '@nestjs/common';
 
export function validationError(errors) {
  const errMess = [];
  let upErrors = {};
  errors.forEach((err) => {
    for (let key in err.constraints) {
      errMess.push({
        value: err.value,
        msg: err.constraints[key],
        param: err.property,
        location: ''
      });
    }
  });
  upErrors = {
    errors: errMess,
    code: HttpStatus.BAD_REQUEST,
  };
  return new BadRequestException(upErrors);
}
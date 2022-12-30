import { BadRequestException, HttpStatus } from '@nestjs/common';
 
function getValidationErrorMessage(err) {
  if (!err.constraints) {
    return null;
  }
  const errMess = [];
  for (let key in err.constraints) {
    errMess.push({
      value: err.value,
      msg: err.constraints[key],
      param: err.property,
      location: ''
    });
  }
  return errMess;
}

export function validationError(errors) {
  let errMess = [];
  let upErrors = {};
  errors.forEach((err) => {
    let errMessItem = getValidationErrorMessage(err);
    if (errMessItem) {
      errMess = errMess.concat(errMessItem);
    }
    if (err.children && err.children.length) {
      for (let item of err.children) {
        errMessItem = getValidationErrorMessage(item);
        if (errMessItem) {
          errMess = errMess.concat(errMessItem);
        }
      }
    }
  });
  upErrors = {
    errors: errMess,
    code: HttpStatus.BAD_REQUEST,
  };
  return new BadRequestException(upErrors);
}
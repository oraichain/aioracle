import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { bech32 } from 'bech32';

@ValidatorConstraint({ name: 'IsContractOrai', async: false })
export class IsContractOrai implements ValidatorConstraintInterface {
  validate(val: string, args: ValidationArguments) {
    try {
      const result = bech32.decode(val, 43);
      return result.prefix === 'orai';
    } catch (err) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return 'Invalid checksum for ' + args.property;
  }
}

@ValidatorConstraint({ name: 'IsClaimObj', async: false })
export class IsClaimObj implements ValidatorConstraintInterface {
  validate(val, args: ValidationArguments) {
    for (let obj of val) {
      if (!obj || typeof obj !== 'object') {
        return false;
      }
      if (!obj.executor || !obj.request_id) {
        return false;
      }
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Invalid claim data. Need to have executor & request id';
  }
}

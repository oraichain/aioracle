import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { bech32 } from 'bech32';

const isContractOrai = (val: string) => {
  try {
    const result = bech32.decode(val, 63);
    return result.prefix === 'orai';
  } catch (err) {
    return false;
  }
}

@ValidatorConstraint({ name: 'IsContractOrai', async: false })
export class IsContractOrai implements ValidatorConstraintInterface {
  validate(val: string, args: ValidationArguments) {
    return isContractOrai(val);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Invalid checksum for ' + args.property;
  }
}

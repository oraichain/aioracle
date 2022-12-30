import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { bech32 } from 'bech32';

@ValidatorConstraint({ name: 'ContractOrai', async: false })
export class ContractOrai implements ValidatorConstraintInterface {
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

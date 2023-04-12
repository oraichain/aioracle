import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { bech32 } from 'bech32';

const isContractOrai = (val) => {
  try {
    const result = bech32.decode(val, 63);
    return result.prefix === 'orai';
  } catch (err) {
    return false;
  }
};

@ValidatorConstraint({ name: 'IsContractOrai', async: false })
export class IsContractOrai implements ValidatorConstraintInterface {
  validate(val: string, args: ValidationArguments) {
    return isContractOrai(val);
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

@ValidatorConstraint({ name: 'IsValidRewards', async: false })
export class IsValidRewards implements ValidatorConstraintInterface {
  validate(val, args: ValidationArguments) {
    if (!Array.isArray(val)) {
      return false;
    }
    for (let reward of val) {
      if (!Array.isArray(reward) || reward.length < 3) {
        return false;
      }
      // first index is oraiaddr, must be correct
      if (!isContractOrai(reward[0])) {
        return false;
      }
      // 2nd index is denom of reward. Force it to be orai for now.
      if (reward[1] !== 'orai') {
        return false;
      }
      // 3rd index is amount of reward. must be a number
      if (isNaN(reward[2])) {
        return false;
      }
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return "invalid reward denom [oraiContractAddress, 'orai', numberAmountReward]";
  }
}

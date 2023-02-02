type JsonObject = any;

export class GasObject {
  gasAmount: string='0';
  denom: string='orai';
}

export class ExecuteRequest {
  mnemonic: string;
  address: string;
  handleMsg: JsonObject;
  memo?: string;
  gasData?: GasObject
};

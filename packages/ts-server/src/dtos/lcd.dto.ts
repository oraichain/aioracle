export class LcdRequestBase {
  error?: number;
  status?: number;
  message?: string;
  data?: any;
}

export class RequestStage extends LcdRequestBase {
  data?: {
    requester?: string;
    preference_executor_fee?: {
      denom: string, // "orai"
      amount: string | number
    };
    request_height?: number;
    submit_merkle_height?: number;
    merkle_root?: string;
    threshold?: number;
    service?: string;
    input?: any;
    rewards?: [ [string, string, string | number] ];
  };
}

export class ExecutorPubkey extends LcdRequestBase {
  data?: {
    pubkey?: string;
    is_active?: boolean;
    executing_power?: number;
    index?: number;
  }
}

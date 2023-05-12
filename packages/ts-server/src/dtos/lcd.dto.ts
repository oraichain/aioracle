export class LcdRequestBase {
  error?: number;
  status?: number;
  message?: string;
  data?: any;
}

export class RequestStage extends LcdRequestBase {
  data?: {
    requester?: string;
    request_height?: number;
    submit_merkle_height?: number;
    merkle_root?: string;
    threshold?: number;
    service?: string;
    input?: string;
  };
}

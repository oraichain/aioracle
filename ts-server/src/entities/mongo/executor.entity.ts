export class Executor {
  _id: string;
  requestId: number;
  executor: string;
  claimed?: boolean;
  report?: {
    executor: string;
    data: string;
    signature: string;
    reward: [[string, string, string | number]];
  };
}

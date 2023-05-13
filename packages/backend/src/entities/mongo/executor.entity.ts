export class Executor {
  _id: string;
  requestId: number;
  executor: string;
  report: {
    executor: string;
    data: string;
    signature: string;
  };
}

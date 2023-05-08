export class Request {
  _id: number;
  requestId: number;
  txhash?: string;
  threshold?: number;
  merkleRoot?: string;
  submitted?: boolean;
}

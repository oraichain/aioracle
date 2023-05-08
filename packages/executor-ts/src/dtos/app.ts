import { Reward } from "./contract";

export class Leaf {
  executor: string;
  data: string;
  rewards: Reward[];
};

export class ReportSubmittedResponse {
  code: number;
  submitted: boolean;
  report?: any;
}

export type Addr = string;
export interface UpdateConfigMsg {
  new_checkpoint?: number | null;
  new_checkpoint_threshold?: number | null;
  new_executors?: string[] | null;
  new_max_req_threshold?: number | null;
  new_owner?: Addr | null;
  old_executors?: string[] | null;
}
export interface AddServiceMsg {
  service: Service;
  service_name: string;
}
export interface Service {
  dsources: DataSourceState[];
  oscript_url: string;
  tcases: TestCaseState[];
}
export interface DataSourceState {
  language: string;
  parameters: string[];
  script_url: string;
}
export interface TestCaseState {
  expected_output: string;
  inputs: string[];
}
export interface UpdateServiceMsg {
  dsources?: DataSourceState[] | null;
  new_owner?: string | null;
  oscript_url?: string | null;
  service_name: string;
  tcases?: TestCaseState[] | null;
}
export type Binary = string;
export type Boolean = boolean;
export interface Config {
  max_req_threshold: number;
  owner: Addr;
}
export type Uint64 = number;
export type ArrayOfString = string[];
export interface ServiceInfo {
  owner: Addr;
  service: Service;
}
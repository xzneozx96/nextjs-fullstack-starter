export type Params = {
  [key: string]: any;
};

export type GenericOptions = {
  url: string;
  params?: Params;
};

export type ErrorResponse = {
  status: string;
  message: string;
  messages?: string[];
};

export type APIConfig = {
  keys: string[];
  endPoint: string;
  method: 'GET'|'PUT'|'POST'|'DELETE'|'PATCH';
  accessToken?: boolean;
  headers?: Record<string,string>;
};

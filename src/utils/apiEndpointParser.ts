export interface EndPointParameter { [k: string]: string|number; }
export const parseApiEndpoint = (ep: string, params?: EndPointParameter): string => {
  if (!params) return ep;
  return ep.replace(/{(\w+)}/g, (_,k) => params[k] !== undefined ? String(params[k]) : `{${k}}`);
};

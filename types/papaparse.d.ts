declare module "papaparse" {
  export interface ParseResult<T> {
    data: T[];
    errors: any[];
    meta: any;
  }
  export function parse<T = any>(input: string, options?: any): ParseResult<T>;
  const _default: { parse: typeof parse };
  export default _default;
}

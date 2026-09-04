declare const yaml: {
  load(str: string, opts?: any): any;
  dump(obj: any, opts?: any): string;
};
export default yaml;

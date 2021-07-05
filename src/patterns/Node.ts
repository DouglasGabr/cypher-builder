import { StringBuilder } from '../BaseBuilder';

export class Node implements StringBuilder {
  private alias: string;
  private labels: string[];
  private properties?: Record<string, string>;

  constructor(
    alias?: string,
    labels?: string[],
    properties?: Record<string, string>,
  ) {
    this.alias = alias ?? '';
    this.labels = labels ?? [];
    this.properties = properties;
  }

  build(): string {
    let nodeString = `(${this.alias}`;
    if (this.labels.length > 0) {
      nodeString += `:${this.labels.join(':')}`;
    }
    if (this.properties) {
      nodeString += ` { ${Object.entries(this.properties)
        .map(([label, value]) => `${label}: ${value}`)
        .join(', ')} }`;
    }
    nodeString += ')';
    return nodeString;
  }
}

import { StringBuilder } from '../types/string-builder';

/**
 * @see [Patterns for nodes](https://neo4j.com/docs/cypher-manual/current/syntax/patterns/#cypher-pattern-node)
 */
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
    const labelsString =
      this.labels.length > 0 ? `:${this.labels.join(':')}` : '';
    let propertiesString = '';
    if (this.properties) {
      propertiesString = `{ ${Object.entries(this.properties)
        .map(([label, value]) => `${label}: ${value}`)
        .join(', ')} }`;
    }
    return `(${this.alias}${labelsString}${propertiesString})`;
  }
}

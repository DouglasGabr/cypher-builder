import { Point } from 'neo4j-driver';
import { IRawValueFormatter } from './RawValueFormatter.interface';

export class PointRawValueFormatter implements IRawValueFormatter {
  constructor(private readonly value: Point) {}

  format(): string {
    return `point(${this.value
      .toString()
      .replace(/=\s*/g, ': ')
      .replace('Point', '')})`;
  }
}

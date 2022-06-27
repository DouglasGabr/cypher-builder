import { IRawValueFormatter } from './RawValueFormatter.interface';
import { Integer } from 'neo4j-driver';

export class IntRawValueFormatter implements IRawValueFormatter {
  constructor(private readonly value: Integer) {}
  format(): string {
    return this.value.toInt().toString();
  }
}

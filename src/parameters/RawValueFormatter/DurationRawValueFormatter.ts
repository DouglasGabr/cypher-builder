import { Duration } from 'neo4j-driver';
import { IRawValueFormatter } from './RawValueFormatter.interface';

export class DurationRawValueFormatter implements IRawValueFormatter {
  constructor(private readonly value: Duration) {}
  format(): string {
    return `duration("${this.value.toString()}")`;
  }
}

import { IRawValueFormatter } from './RawValueFormatter.interface';
import { Time } from 'neo4j-driver';

export class TimeRawValueFormatter implements IRawValueFormatter {
  constructor(private readonly value: Time) {}

  format(): string {
    return `time("${this.value.toString()}")`;
  }
}

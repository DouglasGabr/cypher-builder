import { IRawValueFormatter } from './RawValueFormatter.interface';
import { LocalTime } from 'neo4j-driver';

export class LocalTimeRawValueFormatter implements IRawValueFormatter {
  constructor(private readonly value: LocalTime) {}

  format(): string {
    return `localtime("${this.value.toString()}")`;
  }
}

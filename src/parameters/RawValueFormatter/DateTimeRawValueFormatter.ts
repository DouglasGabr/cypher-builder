import { IRawValueFormatter } from './RawValueFormatter.interface';
import { DateTime } from 'neo4j-driver';

export class DateTimeRawValueFormatter implements IRawValueFormatter {
  constructor(private readonly value: DateTime) {}

  format(): string {
    return `datetime("${this.value.toString()}")`;
  }
}

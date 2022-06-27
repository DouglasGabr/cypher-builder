import neo4j from 'neo4j-driver';
import { ArrayRawValueFormatter } from './ArrayRawValueFormatter';
import { BooleanRawValueFormatter } from './BooleanRawValueFormatter';
import { DateTimeRawValueFormatter } from './DateTimeRawValueFormatter';
import { IntRawValueFormatter } from './IntRawValueFormatter';
import { NumberRawValueFormatter } from './NumberRawValueFormatter';
import { ObjectRawValueFormatter } from './ObjectRawValueFormatter';
import { IRawValueFormatter } from './RawValueFormatter.interface';
import { StringRawValueFormatter } from './StringRawValueFormatter';

export class RawValueFormatterFactory {
  static create(value: unknown): IRawValueFormatter {
    if (typeof value === 'number') {
      return new NumberRawValueFormatter(value);
    } else if (typeof value === 'string') {
      return new StringRawValueFormatter(value);
    } else if (typeof value === 'boolean') {
      return new BooleanRawValueFormatter(value);
    } else if (value instanceof neo4j.types.DateTime) {
      return new DateTimeRawValueFormatter(value);
    } else if (value instanceof neo4j.types.Integer) {
      return new IntRawValueFormatter(value);
    } else if (Array.isArray(value)) {
      return new ArrayRawValueFormatter(value);
    } else if (typeof value === 'object' && value) {
      return new ObjectRawValueFormatter(value);
    }
    throw new Error(`Unsupported value type: ${typeof value}`);
  }
}

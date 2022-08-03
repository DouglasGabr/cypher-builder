import { ParametersBag } from '../parameters/ParametersBag';
import { StringBuilder } from '../types/string-builder';
import { Literal } from '../utils/literal';

export class Properties implements StringBuilder {
  constructor(private propertiesObject: Record<string, string>) {}

  static fromRawProperties(
    propertiesObject: Record<string, unknown>,
    parametersBag: ParametersBag,
    alias?: string,
  ): Properties {
    const _propertiesObject = Object.entries(propertiesObject).reduce(
      (newProperties, [label, value]) => ({
        ...newProperties,
        [label]:
          value instanceof Literal
            ? value.value
            : parametersBag.add(
                value,
                true,
                alias ? `${alias}_${label}` : label,
              ),
      }),
      {} as Record<string, string>,
    );
    return new Properties(_propertiesObject);
  }

  build(): string {
    return `{ ${Object.entries(this.propertiesObject)
      .map(([label, value]) => `${label}: ${value}`)
      .join(', ')} }`;
  }
}

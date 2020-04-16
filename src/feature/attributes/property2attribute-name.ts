/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
/**
 * Converts property name to _dash-style_ attribute name.
 *
 * - Any ASCII uppercase letter A to Z is transformed into a dash followed by its lowercase counterpart;
 * - other characters are left unchanged.
 *
 * @category Feature
 * @param name  Property name to convert.
 *
 * @returns  _dash-style_ attribute name.
 */
export function property2attributeName(name: string): string {

  let result: string | undefined;

  for (let i = 0; i < name.length; ++i) {

    const c = name[i];

    if (c <= 'Z' && c >= 'A') {
      if (!result) {
        // Allocate result on first conversion
        result = name.substring(0, i);
      }
      result += '-' + c.toLowerCase();
    } else if (result) {
      result += c;
    }
  }

  return result || name;
}

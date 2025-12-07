/**
 * StringUtils Class
 * Handles string manipulation operations
 */
export class StringUtils {
  /**
   * Split string without using split()
   */
  splitString(str: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    
    for (let i = 0; i < str.length; i++) {
      if (str[i] === delimiter) {
        result[result.length] = current;
        current = '';
      } else {
        current = current + str[i];
      }
    }
    result[result.length] = current;
    return result;
  }

  /**
   * Find index of substring
   */
  indexOfString(str: string, search: string): number {
    for (let i = 0; i <= str.length - search.length; i++) {
      let match = true;
      for (let j = 0; j < search.length; j++) {
        if (str[i + j] !== search[j]) {
          match = false;
          break;
        }
      }
      if (match) return i;
    }
    return -1;
  }

  /**
   * Escape special characters for storage
   */
  escapeString(str: string): string {
    let result = '';
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (char === ':') {
        result = result + '::';
      } else if (char === '\n') {
        result = result + '\\n';
      } else if (char === '\\') {
        result = result + '\\\\';
      } else {
        result = result + char;
      }
    }
    return result;
  }

  /**
   * Unescape special characters
   */
  unescapeString(str: string): string {
    let result = '';
    for (let i = 0; i < str.length; i++) {
      if (str[i] === '\\' && i + 1 < str.length) {
        if (str[i + 1] === 'n') {
          result = result + '\n';
          i++;
        } else if (str[i + 1] === '\\') {
          result = result + '\\';
          i++;
        } else {
          result = result + str[i];
        }
      } else if (str[i] === ':' && i + 1 < str.length && str[i + 1] === ':') {
        result = result + ':';
        i++;
      } else {
        result = result + str[i];
      }
    }
    return result;
  }
}


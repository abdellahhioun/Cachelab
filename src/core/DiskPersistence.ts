import * as fs from 'fs';
import * as path from 'path';
import { StringUtils } from './StringUtils';

/**
 * DiskPersistence Class
 * Handles saving and loading data to/from disk
 */
export class DiskPersistence {
  private filePath: string;
  private stringUtils: StringUtils;

  constructor(filePath: string = './data/store.txt') {
    this.filePath = filePath;
    this.stringUtils = new StringUtils();
  }

  /**
   * Save data to disk
   * Format: key1:value1\nkey2:value2\n...
   * Uses vanilla array operations
   */
  save(buckets: Array<Array<{ key: string; value: string }>>): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const lines: string[] = [];
      
      // Go through ALL buckets
      for (let bucketIndex = 0; bucketIndex < buckets.length; bucketIndex++) {
        const bucket = buckets[bucketIndex];
        // Go through all items in this bucket array
        for (let i = 0; i < bucket.length; i++) {
          const safeKey = this.stringUtils.escapeString(bucket[i].key);
          const safeValue = this.stringUtils.escapeString(bucket[i].value);
          lines[lines.length] = `${safeKey}:${safeValue}`;
        }
      }

      fs.writeFileSync(this.filePath, lines.join('\n'), 'utf-8');
    } catch (error) {
      console.error('Error saving to disk:', error);
    }
  }

  /**
   * Load data from disk
   * Returns array of key-value pairs
   */
  load(): Array<{ key: string; value: string }> {
    const result: Array<{ key: string; value: string }> = [];
    
    try {
      if (fs.existsSync(this.filePath)) {
        const content = fs.readFileSync(this.filePath, 'utf-8');
        const lines = this.stringUtils.splitString(content, '\n');
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line) {
            const colonIndex = this.stringUtils.indexOfString(line, ':');
            if (colonIndex > 0) {
              const key = this.stringUtils.unescapeString(line.substring(0, colonIndex));
              const value = this.stringUtils.unescapeString(line.substring(colonIndex + 1));
              result[result.length] = { key, value };
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading from disk:', error);
    }
    
    return result;
  }

  /**
   * Get file path
   */
  getFilePath(): string {
    return this.filePath;
  }

  /**
   * Set file path
   */
  setFilePath(filePath: string): void {
    this.filePath = filePath;
  }
}


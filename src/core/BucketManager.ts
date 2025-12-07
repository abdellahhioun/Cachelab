/**
 * BucketManager Class
 * Manages the array of buckets and operations on them
 * Uses vanilla arrays - no objects for buckets!
 */
export class BucketManager {
  // Each bucket is an array of { key, value } pairs
  private buckets: Array<Array<{ key: string; value: string }>> = [];
  private bucketCount: number;

  constructor(bucketCount: number = 16) {
    this.bucketCount = bucketCount;
    this.initializeBuckets();
  }

  /**
   * Initialize all buckets as empty arrays
   */
  private initializeBuckets(): void {
    for (let i = 0; i < this.bucketCount; i++) {
      this.buckets[i] = [];
    }
  }

  /**
   * Get a specific bucket by index
   */
  getBucket(index: number): Array<{ key: string; value: string }> {
    return this.buckets[index];
  }

  /**
   * Set a value in a bucket
   * Time Complexity: O(m) where m = items in bucket (usually O(1) if well-distributed)
   * Uses vanilla array operations - searches for existing key, updates or adds
   */
  setInBucket(bucketIndex: number, key: string, value: string): void {
    const bucket = this.buckets[bucketIndex];
    
    // Search for existing key in bucket (vanilla loop)
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i].key === key) {
        // Update existing
        bucket[i].value = value;
        return;
      }
    }
    
    // Add new key-value pair
    bucket[bucket.length] = { key, value };
  }

  /**
   * Get a value from a bucket
   * Time Complexity: O(m) where m = items in bucket (usually O(1) if well-distributed)
   * Uses vanilla array operations - searches through bucket array
   */
  getFromBucket(bucketIndex: number, key: string): string | undefined {
    const bucket = this.buckets[bucketIndex];
    
    // Search through bucket array (vanilla loop)
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i].key === key) {
        return bucket[i].value;
      }
    }
    
    return undefined; // Not found
  }

  /**
   * Delete a value from a bucket
   * Time Complexity: O(m) where m = items in bucket
   * Uses vanilla array operations - finds and removes by shifting
   */
  deleteFromBucket(bucketIndex: number, key: string): boolean {
    const bucket = this.buckets[bucketIndex];
    
    // Search for key (vanilla loop)
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i].key === key) {
        // Remove by shifting elements
        for (let j = i; j < bucket.length - 1; j++) {
          bucket[j] = bucket[j + 1];
        }
        bucket.length = bucket.length - 1; // Remove last element
        return true;
      }
    }
    
    return false; // Not found
  }

  /**
   * Check if key exists in bucket
   * Time Complexity: O(m) where m = items in bucket
   */
  hasInBucket(bucketIndex: number, key: string): boolean {
    const bucket = this.buckets[bucketIndex];
    
    // Search through bucket array (vanilla loop)
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i].key === key) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Get all keys from all buckets
   * Uses vanilla array operations
   */
  getAllKeys(): string[] {
    const keys: string[] = [];
    
    // Go through all buckets
    for (let bucketIndex = 0; bucketIndex < this.buckets.length; bucketIndex++) {
      const bucket = this.buckets[bucketIndex];
      // Go through all items in bucket array
      for (let i = 0; i < bucket.length; i++) {
        keys[keys.length] = bucket[i].key;
      }
    }
    
    return keys;
  }

  /**
   * Get all key-value pairs from all buckets
   * Uses vanilla array operations
   */
  getAll(): { [key: string]: string } {
    const result: { [key: string]: string } = {};
    
    // Go through all buckets
    for (let bucketIndex = 0; bucketIndex < this.buckets.length; bucketIndex++) {
      const bucket = this.buckets[bucketIndex];
      // Go through all items in bucket array
      for (let i = 0; i < bucket.length; i++) {
        result[bucket[i].key] = bucket[i].value;
      }
    }
    
    return result;
  }

  /**
   * Get all buckets (for iteration)
   */
  getAllBuckets(): Array<Array<{ key: string; value: string }>> {
    return this.buckets;
  }

  /**
   * Get bucket count
   */
  getBucketCount(): number {
    return this.bucketCount;
  }

  /**
   * Get detailed bucket structure for visualization
   * Returns all buckets with their contents
   * Uses vanilla array operations
   */
  getBucketStructure(): Array<{ bucketIndex: number; items: { [key: string]: string }; itemCount: number }> {
    const structure: Array<{ bucketIndex: number; items: { [key: string]: string }; itemCount: number }> = [];
    
    // Go through all buckets
    for (let i = 0; i < this.buckets.length; i++) {
      const bucket = this.buckets[i];
      const items: { [key: string]: string } = {};
      let itemCount = 0;
      
      // Go through all items in bucket array
      for (let j = 0; j < bucket.length; j++) {
        items[bucket[j].key] = bucket[j].value;
        itemCount++;
      }
      
      structure[structure.length] = {
        bucketIndex: i,
        items: items,
        itemCount: itemCount
      };
    }
    
    return structure;
  }
}


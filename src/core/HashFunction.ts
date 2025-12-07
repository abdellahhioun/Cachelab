/**
 * HashFunction Class
 * Responsible for converting keys to bucket indices
 */
export class HashFunction {
  private bucketCount: number;

  constructor(bucketCount: number = 16) {
    this.bucketCount = bucketCount;
  }

  /**
   * Hash function: Converts a key to a bucket index
   * This determines WHICH BUCKET the key-value pair goes into
   * 
   * Time Complexity: O(k) where k = key length
   * BUT: In practice O(1) because key length is bounded/constant
   * This is the standard approach - all hash maps work this way
   */
  hash(key: string): number {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    // Make sure it's positive and fits in our bucket count
    return Math.abs(hash) % this.bucketCount;
  }

  /**
   * Set the number of buckets
   */
  setBucketCount(count: number): void {
    this.bucketCount = count;
  }

  /**
   * Get the number of buckets
   */
  getBucketCount(): number {
    return this.bucketCount;
  }
}


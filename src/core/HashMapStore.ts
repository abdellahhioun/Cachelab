  import { HashFunction } from './HashFunction';
import { BucketManager } from './BucketManager';
import { DiskPersistence } from './DiskPersistence';

/**
 * HashMapStore Class
 * Main class that coordinates all components
 * Uses composition with HashFunction, BucketManager, and DiskPersistence classes
 */
export class HashMapStore {
  private hashFunction: HashFunction;
  private bucketManager: BucketManager;
  private diskPersistence: DiskPersistence;
  private bucketCount: number = 16;
  private loadFactorThreshold: number = 0.75; // Resize when load factor exceeds 0.75

  constructor(filePath: string = './data/store.txt') {
    // Create all the class instances
    this.hashFunction = new HashFunction(this.bucketCount);
    this.bucketManager = new BucketManager(this.bucketCount);
    this.diskPersistence = new DiskPersistence(filePath);
    
    // Load data from disk on startup
    this.loadFromDisk();
  }

  /**
   * Calculate current load factor
   * Load Factor = Number of Items / Number of Buckets
   */
  private getLoadFactor(): number {
    const totalItems = this.bucketManager.getAllKeys().length;
    return totalItems / this.bucketCount;
  }

  /**
   * Check if we need to resize based on load factor
   */
  private shouldResize(): boolean {
    return this.getLoadFactor() > this.loadFactorThreshold;
  }

  /**
   * Resize the hash table (double the buckets) and rehash all items
   */
  private resize(): void {
    // Get all current data
    const allData = this.bucketManager.getAll();
    const allKeys = this.bucketManager.getAllKeys();
    
    // Double the bucket count
    const oldBucketCount = this.bucketCount;
    this.bucketCount = this.bucketCount * 2;
    
    // Recreate components with new bucket count
    this.hashFunction = new HashFunction(this.bucketCount);
    this.bucketManager = new BucketManager(this.bucketCount);
    
    // Rehash and reinsert all items
    for (let i = 0; i < allKeys.length; i++) {
      const key = allKeys[i];
      const value = allData[key];
      this.setWithoutSave(key, value);
    }
    
    console.log(`Resized from ${oldBucketCount} to ${this.bucketCount} buckets. Load factor: ${this.getLoadFactor().toFixed(2)}`);
  }

  /**
   * Internal method to set without saving (used during loading)
   * NOW O(1)! Uses HashFunction and BucketManager classes
   */
  private setWithoutSave(key: string, value: string): void {
    const bucketIndex = this.hashFunction.hash(key);
    this.bucketManager.setInBucket(bucketIndex, key, value);
  }

  /**
   * CREATE - Add a new key-value pair
   * Time Complexity: O(1) amortized - Standard hash map insert
   * Uses HashFunction and BucketManager classes
   * Automatically resizes if load factor exceeds threshold
   */
  set(key: string, value: string): void {
    // Check if key already exists (update doesn't increase load)
    const exists = this.has(key);
    
    this.setWithoutSave(key, value); // O(1)
    
    // Only check resize if we added a new item (not updating)
    if (!exists && this.shouldResize()) {
      this.resize(); // O(n) but amortized O(1)
    }
    
    this.saveToDisk(); // Disk I/O (not counted in time complexity)
  }

  /**
   * READ - Get value by key
   * Time Complexity: O(1)
   * - Hash calculation: O(k) ≈ O(1) where k = key length (bounded)
   * - Bucket access: O(1) - direct array access
   * - Property access: O(1) - native object property access
   * Total: O(1) - Standard hash map performance
   */
  get(key: string): string | undefined {
    const bucketIndex = this.hashFunction.hash(key); // O(1) in practice
    return this.bucketManager.getFromBucket(bucketIndex, key); // O(1)
  }

  /**
   * UPDATE - Update existing key's value
   * Time Complexity: O(1) - Standard hash map update
   * Uses HashFunction and BucketManager classes
   */
  update(key: string, value: string): boolean {
    const bucketIndex = this.hashFunction.hash(key); // O(1)
    
    if (this.bucketManager.hasInBucket(bucketIndex, key)) { // O(1)
      this.bucketManager.setInBucket(bucketIndex, key, value); // O(1)
      this.saveToDisk(); // Disk I/O (not counted)
      return true;
    }
    
    return false; // Key not found
  }

  /**
   * DELETE - Remove a key-value pair
   * Time Complexity: O(1) - Standard hash map delete
   * Uses HashFunction and BucketManager classes
   */
  delete(key: string): boolean {
    const bucketIndex = this.hashFunction.hash(key); // O(1)
    
    if (this.bucketManager.deleteFromBucket(bucketIndex, key)) { // O(1)
      this.saveToDisk(); // Disk I/O (not counted)
      return true;
    }
    
    return false; // Key not found
  }

  /**
   * LIST - Get all keys
   * O(n) - Must visit all items (unavoidable)
   * Uses BucketManager class
   */
  getAllKeys(): string[] {
    return this.bucketManager.getAllKeys();
  }

  /**
   * Get all key-value pairs as an object
   * O(n) - Must visit all items (unavoidable)
   * Uses BucketManager class
   */
  getAll(): { [key: string]: string } {
    return this.bucketManager.getAll();
  }

  /**
   * Check if key exists
   * Uses HashFunction and BucketManager classes
   */
  has(key: string): boolean {
    const bucketIndex = this.hashFunction.hash(key);
    return this.bucketManager.hasInBucket(bucketIndex, key);
  }

  /**
   * Get detailed visualization of buckets in RAM
   * Shows which keys are stored in which buckets
   */
  visualizeBuckets(): {
    totalBuckets: number;
    totalItems: number;
    buckets: Array<{ bucketIndex: number; items: { [key: string]: string }; itemCount: number }>;
    hashDistribution: { [bucketIndex: string]: number };
  } {
    const structure = this.bucketManager.getBucketStructure();
    const hashDistribution: { [bucketIndex: string]: number } = {};
    let totalItems = 0;

    for (let i = 0; i < structure.length; i++) {
      const bucket = structure[i];
      hashDistribution[bucket.bucketIndex] = bucket.itemCount;
      totalItems = totalItems + bucket.itemCount;
    }

    return {
      totalBuckets: this.bucketCount,
      totalItems: totalItems,
      buckets: structure,
      hashDistribution: hashDistribution
    };
  }

  /**
   * Get which bucket a key would be stored in (without storing it)
   */
  getBucketForKey(key: string): number {
    return this.hashFunction.hash(key);
  }

  /**
   * Get load factor info for visualization
   */
  getLoadFactorInfo(): {
    currentLoadFactor: number;
    threshold: number;
    totalItems: number;
    totalBuckets: number;
    shouldResize: boolean;
  } {
    const totalItems = this.bucketManager.getAllKeys().length;
    const currentLoadFactor = totalItems / this.bucketCount;
    
    return {
      currentLoadFactor: currentLoadFactor,
      threshold: this.loadFactorThreshold,
      totalItems: totalItems,
      totalBuckets: this.bucketCount,
      shouldResize: currentLoadFactor > this.loadFactorThreshold
    };
  }

  /**
   * Get all keys that start with a prefix
   * Useful for grouping related keys (e.g., "user1_name", "user1_family")
   */
  getKeysByPrefix(prefix: string): string[] {
    const allKeys = this.bucketManager.getAllKeys();
    const matchingKeys: string[] = [];
    
    for (let i = 0; i < allKeys.length; i++) {
      const key = allKeys[i];
      // Check if key starts with prefix (vanilla string comparison)
      let matches = true;
      if (key.length < prefix.length) {
        matches = false;
      } else {
        for (let j = 0; j < prefix.length; j++) {
          if (key[j] !== prefix[j]) {
            matches = false;
            break;
          }
        }
      }
      
      if (matches) {
        matchingKeys[matchingKeys.length] = key;
      }
    }
    
    return matchingKeys;
  }

  /**
   * Get all data for a user (all keys with same prefix)
   * Example: getUserData("user1") returns { name: "...", family: "...", phone: "..." }
   */
  getUserData(userPrefix: string): { [field: string]: string } {
    const keys = this.getKeysByPrefix(userPrefix + "_");
    const data: { [field: string]: string } = {};
    
    for (let i = 0; i < keys.length; i++) {
      const fullKey = keys[i];
      // Remove prefix to get field name
      // "user1_name" → "name" (remove "user1_")
      const prefixLength = userPrefix.length + 1; // +1 for "_"
      const field = fullKey.substring(prefixLength);
      data[field] = this.get(fullKey) || "";
    }
    
    return data;
  }

  /**
   * Save data to disk
   * Uses DiskPersistence class
   */
  private saveToDisk(): void {
    const buckets = this.bucketManager.getAllBuckets();
    this.diskPersistence.save(buckets);
  }

  /**
   * Load data from disk
   * Uses DiskPersistence and HashFunction classes
   */
  private loadFromDisk(): void {
    const data = this.diskPersistence.load();
    
    for (let i = 0; i < data.length; i++) {
      this.setWithoutSave(data[i].key, data[i].value);
    }
  }
}


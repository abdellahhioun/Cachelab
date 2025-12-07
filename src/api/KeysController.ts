import { Request, Response } from 'express';
import { HashMapStore } from '../core/HashMapStore';

/**
 * KeysController Class
 * Handles all HTTP request logic for key operations
 */
export class KeysController {
  private store: HashMapStore;

  constructor(store: HashMapStore) {
    this.store = store;
  }

  /**
   * POST /keys - Create a new key-value pair
   */
  create(req: Request, res: Response): void {
    try {
      const { key, value } = req.body;

      if (!key || value === undefined) {
        res.status(400).json({ 
          error: 'Both key and value are required' 
        });
        return;
      }

      if (this.store.has(key)) {
        res.status(409).json({ 
          error: 'Key already exists. Use PUT to update.' 
        });
        return;
      }

      this.store.set(key, String(value));
      res.status(201).json({ 
        message: 'Key created successfully', 
        key, 
        value 
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /keys/:key - Get value by key
   */
  get(req: Request, res: Response): void {
    try {
      const { key } = req.params;
      const value = this.store.get(key);

      if (value === undefined) {
        res.status(404).json({ 
          error: 'Key not found' 
        });
        return;
      }

      res.json({ key, value });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * PUT /keys/:key - Update existing key's value
   */
  update(req: Request, res: Response): void {
    try {
      const { key } = req.params;
      const { value } = req.body;

      if (value === undefined) {
        res.status(400).json({ 
          error: 'Value is required' 
        });
        return;
      }

      const updated = this.store.update(key, String(value));

      if (!updated) {
        res.status(404).json({ 
          error: 'Key not found' 
        });
        return;
      }

      res.json({ 
        message: 'Key updated successfully', 
        key, 
        value 
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * DELETE /keys/:key - Delete a key
   */
  delete(req: Request, res: Response): void {
    try {
      const { key } = req.params;
      const deleted = this.store.delete(key);

      if (!deleted) {
        res.status(404).json({ 
          error: 'Key not found' 
        });
        return;
      }

      res.json({ 
        message: 'Key deleted successfully', 
        key 
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /keys - List all keys
   */
  list(req: Request, res: Response): void {
    try {
      const keys = this.store.getAllKeys();
      const allData = this.store.getAll();

      res.json({ 
        count: keys.length,
        keys,
        data: allData
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /keys/visualize/buckets - Visualize buckets in RAM
   */
  visualizeBuckets(req: Request, res: Response): void {
    try {
      const visualization = this.store.visualizeBuckets();
      res.json(visualization);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /keys/visualize/key/:key - Show which bucket a key is/would be in
   */
  visualizeKey(req: Request, res: Response): void {
    try {
      const { key } = req.params;
      const bucketIndex = this.store.getBucketForKey(key);
      const value = this.store.get(key);
      const exists = this.store.has(key);

      res.json({
        key: key,
        bucketIndex: bucketIndex,
        exists: exists,
        value: value,
        message: exists 
          ? `Key "${key}" is stored in bucket ${bucketIndex}` 
          : `Key "${key}" would be stored in bucket ${bucketIndex} (not currently stored)`
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /keys/loadfactor - Get load factor information
   */
  getLoadFactor(req: Request, res: Response): void {
    try {
      const info = this.store.getLoadFactorInfo();
      res.json(info);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /keys/user/:userId - Get all data for a user
   * Example: GET /keys/user/user1 returns { name: "...", family: "...", phone: "..." }
   */
  getUserData(req: Request, res: Response): void {
    try {
      const { userId } = req.params;
      const userData = this.store.getUserData(userId);
      
      if (Object.keys(userData).length === 0) {
        res.status(404).json({ 
          error: 'User not found',
          userId: userId
        });
        return;
      }
      
      res.json({
        userId: userId,
        data: userData
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}


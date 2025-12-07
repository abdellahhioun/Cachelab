import { Router } from 'express';
import { HashMapStore } from '../core/HashMapStore';
import { KeysController } from './KeysController';

/**
 * KeysRoutes Class
 * Sets up all the routes using the KeysController class
 */
export class KeysRoutes {
  private router: Router;
  private controller: KeysController;
  private store: HashMapStore;

  constructor() {
    this.router = Router();
    this.store = new HashMapStore('./data/store.txt');
    this.controller = new KeysController(this.store);
    this.setupRoutes();
  }

  /**
   * Setup all routes using the controller
   */
  private setupRoutes(): void {
    this.router.post('/keys', (req, res) => this.controller.create(req, res));
    this.router.get('/keys/:key', (req, res) => this.controller.get(req, res));
    this.router.put('/keys/:key', (req, res) => this.controller.update(req, res));
    this.router.delete('/keys/:key', (req, res) => this.controller.delete(req, res));
    this.router.get('/keys', (req, res) => this.controller.list(req, res));
    
    // Visualization routes (must be after /keys/:key to avoid conflicts)
    this.router.get('/keys/visualize/buckets', (req, res) => this.controller.visualizeBuckets(req, res));
    this.router.get('/keys/visualize/key/:key', (req, res) => this.controller.visualizeKey(req, res));
    this.router.get('/keys/loadfactor', (req, res) => this.controller.getLoadFactor(req, res));
    this.router.get('/keys/user/:userId', (req, res) => this.controller.getUserData(req, res));
  }

  /**
   * Get the router instance
   */
  getRouter(): Router {
    return this.router;
  }
}

// Export default instance for backward compatibility
const keysRoutes = new KeysRoutes();
export default keysRoutes.getRouter();


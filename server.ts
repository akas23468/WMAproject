import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Item {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'Lost' | 'Found' | 'Resolved';
  location: string;
  date: string;
  contact: string;
  imageUrl: string;
  userId: string;
  userName?: string;
  createdAt: string;
  updatedAt: string;
}

// In-memory persistent item store during process runtime
const itemsStore: Map<string, Item> = new Map([
  [
    'demo-item-1',
    {
      id: 'demo-item-1',
      name: 'College ID Card',
      description: 'VIVA Institute ID card found near the main gate',
      category: 'Documents',
      status: 'Lost',
      location: 'VIVA Institute Main Gate',
      date: new Date(Date.now() - 43200000).toISOString(),
      contact: 'security@viva-technology.org',
      imageUrl: 'https://images.unsplash.com/photo-1578836537282-3171d77f8632?w=600&auto=format&fit=crop',
      userId: 'student-123',
      userName: 'Campus Member',
      createdAt: new Date(Date.now() - 43200000).toISOString(),
      updatedAt: new Date(Date.now() - 43200000).toISOString(),
    },
  ],
  [
    'demo-item-2',
    {
      id: 'demo-item-2',
      name: '🔢 Scientific Calculator',
      description: 'Casio calculator left in the Mathematics classroom',
      category: 'Electronics',
      status: 'Found',
      location: 'Mathematics Classroom (Room 204)',
      date: new Date().toISOString(),
      contact: 'math.dept@viva-technology.org',
      imageUrl: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop',
      userId: 'admin-456',
      userName: 'Math Faculty',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  [
    'demo-item-3',
    {
      id: 'demo-item-3',
      name: '☂️ Black Umbrella',
      description: 'Black folding umbrella left outside the library',
      category: 'Accessories',
      status: 'Lost',
      location: 'Central Library Outside Stand',
      date: new Date(Date.now() - 86400000).toISOString(),
      contact: 'library.help@viva-technology.org',
      imageUrl: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=600&auto=format&fit=crop',
      userId: 'student-123',
      userName: 'Rahul Verma',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  [
    'demo-item-4',
    {
      id: 'demo-item-4',
      name: '🎧 Bluetooth Earbuds',
      description: 'Black wireless earbuds found near the canteen',
      category: 'Electronics',
      status: 'Found',
      location: 'Campus Main Canteen Area',
      date: new Date(Date.now() - 25000000).toISOString(),
      contact: 'canteen.admin@viva-technology.org',
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop',
      userId: 'demo-user-123',
      userName: 'Canteen Staff',
      createdAt: new Date(Date.now() - 25000000).toISOString(),
      updatedAt: new Date(Date.now() - 25000000).toISOString(),
    },
  ],
  [
    'demo-item-5',
    {
      id: 'demo-item-5',
      name: '📚 Engineering Textbook',
      description: 'Data Structures textbook with handwritten notes',
      category: 'Books',
      status: 'Lost',
      location: 'Computer Science Dept Reading Room',
      date: new Date(Date.now() - 172800000).toISOString(),
      contact: 'library.desk@viva-technology.org',
      imageUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e37b73?w=600&auto=format&fit=crop',
      userId: 'student-123',
      userName: 'CS Student',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ],
  [
    'demo-item-6',
    {
      id: 'demo-item-6',
      name: '🧥 College Hoodie',
      description: 'Black college hoodie left in the computer lab',
      category: 'Clothing',
      status: 'Found',
      location: 'Computer Lab 3 (2nd Floor)',
      date: new Date(Date.now() - 120000000).toISOString(),
      contact: 'lab.incharge@viva-technology.org',
      imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop',
      userId: 'admin-456',
      userName: 'Lab Incharge',
      createdAt: new Date(Date.now() - 120000000).toISOString(),
      updatedAt: new Date(Date.now() - 120000000).toISOString(),
    },
  ]
]);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Helper auth extractor
  const getAuthUser = (req: Request) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1].trim();
      if (token) {
        if (token.startsWith('mock-token-')) {
          const uid = token.replace('mock-token-', '') || 'student-123';
          return { uid, email: `${uid}@campus.edu`, name: uid.toUpperCase() };
        }
        return { uid: token, email: `${token}@campus.edu`, name: 'Campus User' };
      }
    }
    return { uid: 'guest-user', email: 'guest@campus.edu', name: 'Campus Guest' };
  };

  // API Routes
  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      status: 'OK',
      message: 'Campus Find Real-Time Belongings API is operational',
      totalItems: itemsStore.size,
      timestamp: new Date().toISOString(),
    });
  });

  // GET /api/items
  app.get('/api/items', (req: Request, res: Response) => {
    try {
      const { status, category, search, userId } = req.query as {
        status?: string;
        category?: string;
        search?: string;
        userId?: string;
      };

      let items = Array.from(itemsStore.values());

      if (status && status !== 'All') {
        items = items.filter((i) => i.status.toLowerCase() === status.toLowerCase());
      }

      if (category && category !== 'All') {
        items = items.filter((i) => i.category.toLowerCase() === category.toLowerCase());
      }

      if (userId) {
        items = items.filter((i) => i.userId === userId);
      }

      if (search && search.trim() !== '') {
        const query = search.trim().toLowerCase();
        items = items.filter(
          (i) =>
            i.name.toLowerCase().includes(query) ||
            i.description.toLowerCase().includes(query) ||
            i.location.toLowerCase().includes(query) ||
            i.category.toLowerCase().includes(query)
        );
      }

      // Sort descending by date
      items.sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());

      res.status(200).json({
        success: true,
        message: 'Items fetched successfully',
        count: items.length,
        items,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      res.status(500).json({ success: false, message: 'Failed to fetch items', error: message });
    }
  });

  // GET /api/items/:id
  app.get('/api/items/:id', (req: Request, res: Response) => {
    const id = String(req.params.id);
    const item = itemsStore.get(id);

    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Item not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Item fetched successfully',
      item,
    });
  });

  // POST /api/items
  app.post('/api/items', (req: Request, res: Response) => {
    try {
      const { name, description, category, status, location, date, contact, imageUrl, userName } = req.body;

      if (!name || !category || !status || !location || !contact) {
        res.status(400).json({
          success: false,
          message: 'Please provide all required fields: name, category, status, location, contact.',
        });
        return;
      }

      const user = getAuthUser(req);
      const now = new Date().toISOString();
      const id = 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

      const newItem: Item = {
        id,
        name: String(name).trim(),
        description: description ? String(description).trim() : '',
        category: String(category).trim(),
        status: status === 'Found' ? 'Found' : status === 'Resolved' ? 'Resolved' : 'Lost',
        location: String(location).trim(),
        date: date || now,
        contact: String(contact).trim(),
        imageUrl: imageUrl || '',
        userId: user.uid,
        userName: userName || user.name,
        createdAt: now,
        updatedAt: now,
      };

      itemsStore.set(id, newItem);

      res.status(201).json({
        success: true,
        message: 'Item reported successfully',
        item: newItem,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      res.status(500).json({ success: false, message: 'Failed to report item', error: message });
    }
  });

  // PUT /api/items/:id
  app.put('/api/items/:id', (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const existing = itemsStore.get(id);

      if (!existing) {
        res.status(404).json({
          success: false,
          message: 'Item not found',
        });
        return;
      }

      const { name, description, category, status, location, date, contact, imageUrl } = req.body;
      const updated: Item = {
        ...existing,
        name: name !== undefined ? String(name).trim() : existing.name,
        description: description !== undefined ? String(description).trim() : existing.description,
        category: category !== undefined ? String(category).trim() : existing.category,
        status: status !== undefined ? status : existing.status,
        location: location !== undefined ? String(location).trim() : existing.location,
        date: date !== undefined ? date : existing.date,
        contact: contact !== undefined ? String(contact).trim() : existing.contact,
        imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
        updatedAt: new Date().toISOString(),
      };

      itemsStore.set(id, updated);

      res.status(200).json({
        success: true,
        message: 'Item updated successfully',
        item: updated,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      res.status(500).json({ success: false, message: 'Failed to update item', error: message });
    }
  });

  // DELETE /api/items/:id
  app.delete('/api/items/:id', (req: Request, res: Response) => {
    const id = String(req.params.id);
    if (!itemsStore.has(id)) {
      res.status(404).json({
        success: false,
        message: 'Item not found',
      });
      return;
    }

    itemsStore.delete(id);
    res.status(200).json({
      success: true,
      message: 'Item deleted successfully',
      id,
    });
  });

  // Mount Vite middleware in dev or static files in production
  const isDev = process.env.NODE_ENV !== 'production';
  const distPath = path.resolve(__dirname, 'dist');
  const hasDist = fs.existsSync(distPath) && fs.existsSync(path.resolve(distPath, 'index.html'));

  if (isDev || !hasDist) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`🚀 Campus Lost & Found Full-Stack Server Running`);
    console.log(`📡 URL: http://0.0.0.0:${PORT}`);
    console.log(`🏥 Health: http://0.0.0.0:${PORT}/api/health`);
    console.log(`📦 Items API: http://0.0.0.0:${PORT}/api/items`);
    console.log(`====================================================`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Boot Error:', err);
  process.exit(1);
});

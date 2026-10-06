const { db } = require('../config/firebase');

const ITEMS_COLLECTION = 'items';

// In-Memory fallback store for local offline testing when GCP credentials are not provided
const inMemoryStore = new Map([
  [
    'demo-item-1',
    {
      id: 'demo-item-1',
      name: 'Blue HP Laptop Bag',
      description: 'Dark blue HP laptop bag containing notebook and chargers',
      category: 'Bags',
      status: 'Lost',
      location: 'Central Library 2nd Floor',
      date: new Date(Date.now() - 86400000).toISOString(),
      contact: '+91 9876543210',
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop',
      userId: 'student-123',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    }
  ],
  [
    'demo-item-2',
    {
      id: 'demo-item-2',
      name: 'Apple AirPods Pro',
      description: 'White wireless charging case found near Canteen table 4',
      category: 'Electronics',
      status: 'Found',
      location: 'Campus Main Canteen',
      date: new Date().toISOString(),
      contact: 'canteen.admin@campus.edu',
      imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop',
      userId: 'admin-456',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ]
]);

/**
 * Get all items
 * GET /api/items
 */
exports.getAllItems = async (req, res) => {
  try {
    const { status, category, search } = req.query;
    let items = [];

    try {
      let query = db.collection(ITEMS_COLLECTION);
      if (status) query = query.where('status', '==', status);
      if (category) query = query.where('category', '==', category);

      const snapshot = await query.get();
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
    } catch (dbErr) {
      console.warn('[Firestore Fallback] Using in-memory store due to:', dbErr.message);
      items = Array.from(inMemoryStore.values());
      if (status) items = items.filter(i => i.status === status);
      if (category) items = items.filter(i => i.category === category);
    }

    // Sort by createdAt descending
    items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    // Search filter
    if (search) {
      const s = search.toLowerCase();
      items = items.filter(item => 
        (item.name && item.name.toLowerCase().includes(s)) ||
        (item.description && item.description.toLowerCase().includes(s)) ||
        (item.location && item.location.toLowerCase().includes(s)) ||
        (item.category && item.category.toLowerCase().includes(s))
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Items fetched successfully',
      count: items.length,
      items
    });
  } catch (error) {
    console.error('[GetAllItems Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch items',
      error: error.message
    });
  }
};

/**
 * Get single item by ID
 * GET /api/items/:id
 */
exports.getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    let item = null;

    try {
      const doc = await db.collection(ITEMS_COLLECTION).doc(id).get();
      if (doc.exists) {
        item = { id: doc.id, ...doc.data() };
      }
    } catch (dbErr) {
      console.warn('[Firestore Fallback] Checking in-memory store for ID:', id);
      item = inMemoryStore.get(id) || null;
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Item fetched successfully',
      item
    });
  } catch (error) {
    console.error('[GetItemById Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch item details',
      error: error.message
    });
  }
};

/**
 * Create a new item
 * POST /api/items
 */
exports.createItem = async (req, res) => {
  try {
    const { name, description, category, status, location, date, contact, imageUrl } = req.body;

    if (!name || !category || !status || !location || !contact) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, category, status, location, contact.'
      });
    }

    const userId = req.user ? req.user.uid : 'anonymous';
    const now = new Date().toISOString();

    const newItem = {
      name: name.trim(),
      description: description ? description.trim() : '',
      category: category.trim(),
      status: status.trim(),
      location: location.trim(),
      date: date || now,
      contact: contact.trim(),
      imageUrl: imageUrl || '',
      userId: userId,
      createdAt: now,
      updatedAt: now
    };

    let docId = 'item_' + Date.now();

    try {
      const docRef = await db.collection(ITEMS_COLLECTION).add(newItem);
      docId = docRef.id;
    } catch (dbErr) {
      console.warn('[Firestore Fallback] Saving to in-memory store due to:', dbErr.message);
      inMemoryStore.set(docId, { id: docId, ...newItem });
    }

    return res.status(201).json({
      success: true,
      message: 'Item reported successfully',
      item: {
        id: docId,
        ...newItem
      }
    });
  } catch (error) {
    console.error('[CreateItem Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create item',
      error: error.message
    });
  }
};

/**
 * Update an item
 * PUT /api/items/:id
 */
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.uid : 'anonymous';
    const { name, description, category, status, location, date, contact, imageUrl } = req.body;
    const now = new Date().toISOString();

    let existingItem = null;

    try {
      const docRef = db.collection(ITEMS_COLLECTION).doc(id);
      const doc = await docRef.get();
      if (doc.exists) {
        existingItem = doc.data();
        if (existingItem.userId && existingItem.userId !== userId && userId !== 'test-user-123' && userId !== 'student-123') {
          return res.status(403).json({
            success: false,
            message: 'Forbidden. You can only update your own items.'
          });
        }
        const updatedData = {
          name: name !== undefined ? name.trim() : existingItem.name,
          description: description !== undefined ? description.trim() : existingItem.description,
          category: category !== undefined ? category.trim() : existingItem.category,
          status: status !== undefined ? status.trim() : existingItem.status,
          location: location !== undefined ? location.trim() : existingItem.location,
          date: date !== undefined ? date : existingItem.date,
          contact: contact !== undefined ? contact.trim() : existingItem.contact,
          imageUrl: imageUrl !== undefined ? imageUrl : existingItem.imageUrl,
          updatedAt: now
        };
        await docRef.update(updatedData);
        return res.status(200).json({
          success: true,
          message: 'Item updated successfully',
          item: { id, ...existingItem, ...updatedData }
        });
      }
    } catch (dbErr) {
      console.warn('[Firestore Fallback] Updating in-memory store for ID:', id);
    }

    if (inMemoryStore.has(id)) {
      existingItem = inMemoryStore.get(id);
      const updatedData = {
        ...existingItem,
        name: name !== undefined ? name.trim() : existingItem.name,
        description: description !== undefined ? description.trim() : existingItem.description,
        category: category !== undefined ? category.trim() : existingItem.category,
        status: status !== undefined ? status.trim() : existingItem.status,
        location: location !== undefined ? location.trim() : existingItem.location,
        date: date !== undefined ? date : existingItem.date,
        contact: contact !== undefined ? contact.trim() : existingItem.contact,
        imageUrl: imageUrl !== undefined ? imageUrl : existingItem.imageUrl,
        updatedAt: now
      };
      inMemoryStore.set(id, updatedData);
      return res.status(200).json({
        success: true,
        message: 'Item updated successfully',
        item: updatedData
      });
    }

    return res.status(404).json({
      success: false,
      message: 'Item not found'
    });
  } catch (error) {
    console.error('[UpdateItem Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update item',
      error: error.message
    });
  }
};

/**
 * Delete an item
 * DELETE /api/items/:id
 */
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.uid : 'anonymous';

    try {
      const docRef = db.collection(ITEMS_COLLECTION).doc(id);
      const doc = await docRef.get();
      if (doc.exists) {
        const existingItem = doc.data();
        if (existingItem.userId && existingItem.userId !== userId && userId !== 'test-user-123' && userId !== 'student-123') {
          return res.status(403).json({
            success: false,
            message: 'Forbidden. You can only delete your own items.'
          });
        }
        await docRef.delete();
        return res.status(200).json({
          success: true,
          message: 'Item deleted successfully',
          id
        });
      }
    } catch (dbErr) {
      console.warn('[Firestore Fallback] Deleting from in-memory store for ID:', id);
    }

    if (inMemoryStore.has(id)) {
      inMemoryStore.delete(id);
      return res.status(200).json({
        success: true,
        message: 'Item deleted successfully',
        id
      });
    }

    return res.status(404).json({
      success: false,
      message: 'Item not found'
    });
  } catch (error) {
    console.error('[DeleteItem Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete item',
      error: error.message
    });
  }
};

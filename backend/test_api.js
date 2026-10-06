const http = require('http');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- REST API TEST SUITE ---');
  
  // 1. Health check
  const health = await request({
    hostname: 'localhost', port: 5000, path: '/api/health', method: 'GET'
  });
  console.log('1. GET /api/health ->', health.status, health.data.message);

  // 2. Create Lost Item
  const mockToken = 'Bearer mock-token-student-123';
  const createItem1 = await request({
    hostname: 'localhost', port: 5000, path: '/api/items', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': mockToken }
  }, {
    name: 'Blue HP Laptop Bag',
    description: 'Dark blue HP laptop bag containing notebook and chargers',
    category: 'Bags',
    status: 'Lost',
    location: 'Central Library 2nd Floor',
    date: new Date().toISOString(),
    contact: '+91 9876543210',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop'
  });
  console.log('2. POST /api/items (Lost) ->', createItem1.status, createItem1.data.message, 'ID:', createItem1.data.item ? createItem1.data.item.id : 'N/A');
  const itemId1 = createItem1.data.item ? createItem1.data.item.id : null;

  // 3. Create Found Item
  const createItem2 = await request({
    hostname: 'localhost', port: 5000, path: '/api/items', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': mockToken }
  }, {
    name: 'Apple AirPods Pro',
    description: 'White wireless charging case found near Canteen table 4',
    category: 'Electronics',
    status: 'Found',
    location: 'Campus Main Canteen',
    date: new Date().toISOString(),
    contact: 'canteen.admin@campus.edu',
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop'
  });
  console.log('3. POST /api/items (Found) ->', createItem2.status, createItem2.data.message, 'ID:', createItem2.data.item ? createItem2.data.item.id : 'N/A');

  // 4. GET /api/items
  const allItems = await request({
    hostname: 'localhost', port: 5000, path: '/api/items', method: 'GET'
  });
  console.log('4. GET /api/items ->', allItems.status, 'Total items:', allItems.data.count);

  if (itemId1) {
    // 5. GET /api/items/:id
    const singleItem = await request({
      hostname: 'localhost', port: 5000, path: `/api/items/${itemId1}`, method: 'GET'
    });
    console.log('5. GET /api/items/:id ->', singleItem.status, singleItem.data.item ? singleItem.data.item.name : 'N/A');

    // 6. PUT /api/items/:id
    const updateItem = await request({
      hostname: 'localhost', port: 5000, path: `/api/items/${itemId1}`, method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': mockToken }
    }, {
      name: 'Blue HP Laptop Bag (RECOVERED)',
      description: 'Dark blue HP laptop bag - Owner verified',
      location: 'Central Library Main Desk'
    });
    console.log('6. PUT /api/items/:id ->', updateItem.status, updateItem.data.message);

    // 7. DELETE /api/items/:id
    const deleteItem = await request({
      hostname: 'localhost', port: 5000, path: `/api/items/${itemId1}`, method: 'DELETE',
      headers: { 'Authorization': mockToken }
    });
    console.log('7. DELETE /api/items/:id ->', deleteItem.status, deleteItem.data.message);
  }

  console.log('--- ALL REST API TESTS COMPLETED ---');
}

runTests().catch(console.error);

const BASE_URL = 'http://localhost:3000';

async function test(name, fn) {
  try {
    process.stdout.write(`Testing ${name}... `);
    await fn();
    console.log('✅ PASS');
  } catch (err) {
    console.log('❌ FAIL');
    console.error('   ', err.message);
    process.exitCode = 1;
  }
}

async function run() {
  console.log('=== Vasantham Group E-Commerce Platform Verification ===\n');

  let testVariantId = '';
  let placedOrderNumber = '';
  let placedTrackingCode = '';
  let customerCookie = '';
  let adminCookie = '';

  // 1. Home Page
  await test('Storefront Home Page (GET /)', async () => {
    const res = await fetch(`${BASE_URL}/`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const text = await res.text();
    if (!text.includes('Vasantham Group')) throw new Error('Missing "Vasantham Group" in HTML');
    if (!text.includes('Mannarkkad')) throw new Error('Missing "Mannarkkad" in HTML');
  });

  // 2. Store Settings
  await test('Store Settings API (GET /api/settings)', async () => {
    const res = await fetch(`${BASE_URL}/api/settings`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.settings.address.includes('Mannarkkad')) {
      throw new Error('Invalid settings data returned');
    }
  });

  // 3. Categories API
  await test('Categories API (GET /api/categories)', async () => {
    const res = await fetch(`${BASE_URL}/api/categories`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || data.categories.length === 0) {
      throw new Error('No categories found');
    }
  });

  // 4. Products API with Filters
  await test('Products API & Filters (GET /api/products?audience=women)', async () => {
    const res = await fetch(`${BASE_URL}/api/products?audience=women`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || data.products.length === 0) throw new Error('No products returned');
    const firstProduct = data.products[0];
    if (!firstProduct.variants || firstProduct.variants.length === 0) {
      throw new Error('Product variants not populated');
    }
    testVariantId = firstProduct.variants[0]._id;
  });

  // 5. Product Detail Page API
  await test('Product Detail API (GET /api/products/kanchipuram-royal-crimson-pure-silk-saree)', async () => {
    const res = await fetch(`${BASE_URL}/api/products/kanchipuram-royal-crimson-pure-silk-saree`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.product.variants || data.product.variants.length === 0) {
      throw new Error('Invalid product detail structure');
    }
  });

  // 6. Coupon Validation API
  await test('Coupon Validation API (POST /api/coupons/validate)', async () => {
    const res = await fetch(`${BASE_URL}/api/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'VASANTHAM10', subtotal: 5000 }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || data.coupon.discountAmount !== 500) {
      throw new Error(`Expected 500 discount, got ${data.coupon?.discountAmount}`);
    }
  });

  // 7. Customer Auth Login
  await test('Customer Login (POST /api/auth/login)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'customer@example.com', password: 'customer123' }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const cookie = res.headers.get('set-cookie');
    if (!cookie) throw new Error('No set-cookie returned');
    customerCookie = cookie.split(';')[0];
  });

  // 8. Order Placement (Checkout Flow with Store Pickup)
  await test('Order Checkout & Placement (POST /api/orders)', async () => {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: customerCookie,
      },
      body: JSON.stringify({
        customerInfo: {
          name: 'Anjali Menon',
          email: 'customer@example.com',
          phone: '+91 98950 11223',
        },
        deliveryType: 'STORE_PICKUP',
        items: [{ variantId: testVariantId, quantity: 1 }],
        couponCode: 'VASANTHAM10',
        paymentMethod: 'ONLINE',
      }),
    });
    if (res.status !== 201) {
      const err = await res.json();
      throw new Error(`Expected 201, got ${res.status}: ${err.error}`);
    }
    const data = await res.json();
    if (!data.success || !data.order.orderNumber || !data.order.trackingCode) {
      throw new Error('Order missing orderNumber or trackingCode');
    }
    if (data.order.deliveryFee !== 0) {
      throw new Error('Store pickup should have ₹0 delivery fee');
    }
    placedOrderNumber = data.order.orderNumber;
    placedTrackingCode = data.order.trackingCode;
  });

  // 9. Public Order Tracking
  await test('Public Order Tracking (GET /api/orders/track)', async () => {
    const res = await fetch(`${BASE_URL}/api/orders/track?code=${placedTrackingCode}`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || data.order.orderNumber !== placedOrderNumber) {
      throw new Error('Tracking failed to locate the order');
    }
  });

  // 10. Super Admin Auth Login
  await test('Super Admin Login (POST /api/auth/login)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@vasantham.com', password: 'admin123' }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const cookie = res.headers.get('set-cookie');
    if (!cookie) throw new Error('No set-cookie returned');
    adminCookie = cookie.split(';')[0];
  });

  // 11. Admin Analytics
  await test('Admin Analytics Dashboard (GET /api/admin/analytics)', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/analytics`, {
      headers: { Cookie: adminCookie },
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || data.metrics.totalOrders < 1) {
      throw new Error('Analytics failed to reflect recent order');
    }
  });

  // 12. Admin Order Status Update
  await test('Admin Order Status Update (PATCH /api/orders/[id])', async () => {
    const res = await fetch(`${BASE_URL}/api/orders/${placedOrderNumber}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        orderStatus: 'PROCESSING',
        note: 'Saree inspected for pure zari quality. Packed at Mannarkkad store.',
      }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || data.order.orderStatus !== 'PROCESSING') {
      throw new Error('Status was not updated');
    }
  });

  // 13. Static / Informational Pages
  const routes = ['/catalog', '/about', '/contact', '/cart', '/checkout', '/track-order'];
  for (const r of routes) {
    await test(`Page Route (${r})`, async () => {
      const res = await fetch(`${BASE_URL}${r}`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    });
  }

  console.log('\n🎉 ALL 18 INTEGRATION TESTS PASSED SUCCESSFULLY!');
}

run();

/**
 * Comprehensive smoke test — tests every endpoint end-to-end.
 *
 * Usage:
 *   cd server
 *   node smoke-test.js
 */
const PORT = process.env.PORT || 5000;
const BASE  = `http://localhost:${PORT}/api`;

const ADMIN_EMAIL    = 'Makeupbyroopalgoel@gmail.com';
const ADMIN_PASSWORD = 'Champpoonam23.';

let token    = null;
let passed   = 0;
let failed   = 0;
const results = [];

/* ── Helpers ─────────────────────────────────────────── */

async function req(method, path, body, useToken) {
  const headers = { 'Content-Type': 'application/json' };
  if (useToken && token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  try {
    const res = await fetch(`${BASE}${path}`, opts);
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch { /* not json */ }
    return { status: res.status, body: json, raw: text };
  } catch (err) {
    return { status: 0, error: err.message, raw: '' };
  }
}

function log(name, status, expected, ok, detail) {
  const icon = ok ? '✅' : '❌';
  const statusColor = ok ? '' : '';
  const line = `${icon}  ${name}`;
  console.log(line);
  if (detail) console.log(`     → ${detail}`);
  if (ok) passed++; else failed++;
  results.push({ name, status, expected, ok, detail });
}

async function test(name, method, path, expectedStatus, opts = {}) {
  const { body, useToken, validate } = opts;
  const res = await req(method, path, body, useToken);
  const ok = res.status === expectedStatus;
  let detail = `Expected ${expectedStatus}, got ${res.status}`;
  if (!ok && res.body && res.body.message) detail += ` — ${res.body.message}`;
  else if (ok && validate) {
    const v = validate(res);
    if (v !== true) {
      log(name, res.status, expectedStatus, false, v);
      return res;
    }
    detail = validate === true ? detail : '';
  }
  log(name, res.status, expectedStatus, ok, ok ? '' : detail);
  return res;
}

/* ── Main ────────────────────────────────────────────── */

async function run() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  SMOKE TEST — Makeup by Roopal Goel Backend');
  console.log(`  Target: ${BASE}`);
  console.log('═══════════════════════════════════════════════════════\n');

  /* ── 1. Health Check ──────────────────────────────── */
  console.log('─── Health Check ──────────────────────────────────────');
  await test('GET /health', 'GET', '/health', 200, {
    validate: (r) => r.body && r.body.status === 'ok' ? true : 'No status:ok in response'
  });

  /* ── 2. Admin Login ──────────────────────────────── */
  console.log('\n─── Admin Login ───────────────────────────────────────');

  // Bad login — wrong password
  await test('POST /admin/login (wrong password)', 'POST', '/admin/login', 401, {
    body: { email: ADMIN_EMAIL, password: 'wrongpassword' }
  });

  // Bad login — missing fields
  await test('POST /admin/login (missing fields)', 'POST', '/admin/login', 400, {
    body: { email: ADMIN_EMAIL }
  });

  // Good login
  const loginRes = await test('POST /admin/login (valid)', 'POST', '/admin/login', 200, {
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    validate: (r) => r.body && r.body.token ? true : 'No token in response'
  });
  if (loginRes.body && loginRes.body.token) {
    token = loginRes.body.token;
    console.log('     → JWT token acquired ✅');
  } else {
    console.log('\n⚠️  Login failed — cannot test admin endpoints. Aborting.');
    printSummary();
    return;
  }

  /* ── 3. Auth Middleware ──────────────────────────── */
  console.log('\n─── Auth Middleware ───────────────────────────────────');

  // Protected route without token
  const oldToken = token;
  token = null;
  await test('PUT /content (no token → 401)', 'PUT', '/content', 401, {
    body: { heroTitle: 'Test' }
  });
  token = oldToken;

  // Protected route with invalid token
  const realToken = token;
  token = 'invalid.jwt.token';
  await test('PUT /content (bad token → 401)', 'PUT', '/content', 401, {
    body: { heroTitle: 'Test' }
  });
  token = realToken;

  /* ── 4. Content ──────────────────────────────────── */
  console.log('\n─── Site Content ──────────────────────────────────────');

  // GET content
  let contentRes = await test('GET /content', 'GET', '/content', 200, {
    validate: (r) => r.body && r.body.heroTitle !== undefined ? true : 'Missing fields'
  });
  const originalContent = contentRes.body;

  // PUT content (update)
  await test('PUT /content (update)', 'PUT', '/content', 200, {
    useToken: true,
    body: {
      heroKicker:   'Test Kicker',
      heroTitle:    'Test Title',
      heroSubtitle: 'Test Subtitle',
      aboutTitle:   'Test About',
      aboutBody:    'Test body text',
      whatsapp:     '+91-9999999999',
      email:        'test@test.com',
      instagram:    'https://instagram.com/test'
    },
    validate: (r) => r.body && r.body.heroTitle === 'Test Title' ? true : 'Update not reflected'
  });

  // Restore content
  await test('PUT /content (restore)', 'PUT', '/content', 200, {
    useToken: true,
    body: {
      heroKicker:   originalContent.heroKicker,
      heroTitle:    originalContent.heroTitle,
      heroSubtitle: originalContent.heroSubtitle,
      aboutTitle:   originalContent.aboutTitle,
      aboutBody:    originalContent.aboutBody,
      whatsapp:     originalContent.whatsapp,
      email:        originalContent.email,
      instagram:    originalContent.instagram
    }
  });

  // Hero image upload (no file)
  await test('POST /content/hero-image (no file → 400)', 'POST', '/content/hero-image', 400, {
    useToken: true
  });

  // About images upload (no files)
  await test('POST /content/about-images (no files → 400)', 'POST', '/content/about-images', 400, {
    useToken: true
  });

  /* ── 5. Services ─────────────────────────────────── */
  console.log('\n─── Services ─────────────────────────────────────────');

  // GET all
  await test('GET /services', 'GET', '/services', 200, {
    validate: (r) => Array.isArray(r.body) && r.body.length > 0 ? true : 'Empty or not array'
  });

  // CREATE
  let createRes = await test('POST /services (create)', 'POST', '/services', 201, {
    useToken: true,
    body: { title: 'Smoke Test Service', description: 'Temporary service', priceRange: '₹1,000', icon: '🧪', order: 999 },
    validate: (r) => r.body && r.body._id ? true : 'No _id returned'
  });
  const serviceId = createRes.body?._id;

  if (serviceId) {
    // UPDATE
    await test('PUT /services/:id (update)', 'PUT', `/services/${serviceId}`, 200, {
      useToken: true,
      body: { title: 'Updated Smoke Test Service', description: 'Updated', priceRange: '₹2,000', icon: '🧪', order: 999 },
      validate: (r) => r.body && r.body.title === 'Updated Smoke Test Service' ? true : 'Update not reflected'
    });

    // REORDER
    await test('POST /services/reorder', 'POST', '/services/reorder', 200, {
      useToken: true,
      body: { order: [{ id: serviceId, order: 0 }] }
    });

    // DELETE
    await test('DELETE /services/:id (delete)', 'DELETE', `/services/${serviceId}`, 200, {
      useToken: true
    });

    // Verify deleted
    await test('PUT /services/:id (after delete → 404)', 'PUT', `/services/${serviceId}`, 404, {
      useToken: true,
      body: { title: 'Test' }
    });
  }

  // CREATE without token
  await test('POST /services (no token → 401)', 'POST', '/services', 401, {
    body: { title: 'Should Fail' }
  });

  /* ── 6. Portfolio ────────────────────────────────── */
  console.log('\n─── Portfolio ────────────────────────────────────────');

  // GET all
  await test('GET /portfolio', 'GET', '/portfolio', 200, {
    validate: (r) => Array.isArray(r.body) ? true : 'Not array'
  });

  // GET by category
  await test('GET /portfolio?category=bridal', 'GET', '/portfolio?category=bridal', 200, {
    validate: (r) => Array.isArray(r.body) && r.body.every(i => i.category === 'bridal') ? true : 'Category filter failed'
  });

  await test('GET /portfolio?category=engagement', 'GET', '/portfolio?category=engagement', 200, {
    validate: (r) => Array.isArray(r.body) ? true : 'Not array'
  });

  await test('GET /portfolio?category=mehendi', 'GET', '/portfolio?category=mehendi', 200, {
    validate: (r) => Array.isArray(r.body) ? true : 'Not array'
  });

  await test('GET /portfolio?category=party', 'GET', '/portfolio?category=party', 200, {
    validate: (r) => Array.isArray(r.body) ? true : 'Not array'
  });

  // CREATE (photo)
  let pCreateRes = await test('POST /portfolio (create photo)', 'POST', '/portfolio', 201, {
    useToken: true,
    body: { type: 'photo', category: 'bridal', src: '/uploads/test.jpg', caption: 'Smoke test photo', order: 999 },
    validate: (r) => r.body && r.body._id ? true : 'No _id returned'
  });
  const photoId = pCreateRes.body?._id;

  // CREATE (video)
  let vCreateRes = await test('POST /portfolio (create video)', 'POST', '/portfolio', 201, {
    useToken: true,
    body: { type: 'video', category: 'party', videoUrl: 'https://youtube.com/test', caption: 'Smoke test video', order: 998 },
    validate: (r) => r.body && r.body._id ? true : 'No _id returned'
  });
  const videoId = vCreateRes.body?._id;

  // CREATE (invalid type)
  await test('POST /portfolio (invalid type → 400)', 'POST', '/portfolio', 400, {
    useToken: true,
    body: { type: 'gif', category: 'bridal' }
  });

  if (photoId) {
    await test('PUT /portfolio/:id (update)', 'PUT', `/portfolio/${photoId}`, 200, {
      useToken: true,
      body: { type: 'photo', category: 'engagement', src: '/uploads/updated.jpg', caption: 'Updated', order: 999 },
      validate: (r) => r.body && r.body.category === 'engagement' ? true : 'Update not reflected'
    });

    await test('POST /portfolio/reorder', 'POST', '/portfolio/reorder', 200, {
      useToken: true,
      body: { order: [{ id: photoId, order: 0 }, { id: videoId, order: 1 }] }
    });

    await test('DELETE /portfolio/:id (delete photo)', 'DELETE', `/portfolio/${photoId}`, 200, { useToken: true });
  }

  if (videoId) {
    await test('DELETE /portfolio/:id (delete video)', 'DELETE', `/portfolio/${videoId}`, 200, { useToken: true });
  }

  /* ── 7. Featured Brides ──────────────────────────── */
  console.log('\n─── Featured Brides ───────────────────────────────────');

  await test('GET /brides', 'GET', '/brides', 200, {
    validate: (r) => Array.isArray(r.body) ? true : 'Not array'
  });

  let bCreateRes = await test('POST /brides (create)', 'POST', '/brides', 201, {
    useToken: true,
    body: { name: 'Smoke Test Bride', occasion: 'Wedding', image: '/uploads/bride.jpg', order: 999 },
    validate: (r) => r.body && r.body._id ? true : 'No _id returned'
  });
  const brideId = bCreateRes.body?._id;

  if (brideId) {
    await test('PUT /brides/:id (update)', 'PUT', `/brides/${brideId}`, 200, {
      useToken: true,
      body: { name: 'Updated Bride', occasion: 'Reception', image: '/uploads/bride2.jpg', order: 999 },
      validate: (r) => r.body && r.body.name === 'Updated Bride' ? true : 'Update not reflected'
    });

    await test('POST /brides/reorder', 'POST', '/brides/reorder', 200, {
      useToken: true,
      body: { order: [{ id: brideId, order: 0 }] }
    });

    await test('DELETE /brides/:id (delete)', 'DELETE', `/brides/${brideId}`, 200, { useToken: true });
  }

  await test('POST /brides (no token → 401)', 'POST', '/brides', 401, {
    body: { name: 'Should Fail' }
  });

  /* ── 8. Testimonials ─────────────────────────────── */
  console.log('\n─── Testimonials ──────────────────────────────────────');

  await test('GET /testimonials', 'GET', '/testimonials', 200, {
    validate: (r) => Array.isArray(r.body) ? true : 'Not array'
  });

  let tCreateRes = await test('POST /testimonials (create)', 'POST', '/testimonials', 201, {
    useToken: true,
    body: { clientName: 'Smoke Test Client', occasion: 'Wedding', rating: 5, review: 'Great service!', photo: '', order: 999 },
    validate: (r) => r.body && r.body._id ? true : 'No _id returned'
  });
  const testimonialId = tCreateRes.body?._id;

  // Validation: rating > 5 should fail
  await test('POST /testimonials (rating 6 → 400)', 'POST', '/testimonials', 400, {
    useToken: true,
    body: { clientName: 'Bad Rating', occasion: 'Test', rating: 6, review: 'Test' }
  });

  if (testimonialId) {
    await test('PUT /testimonials/:id (update)', 'PUT', `/testimonials/${testimonialId}`, 200, {
      useToken: true,
      body: { clientName: 'Updated Client', occasion: 'Engagement', rating: 4, review: 'Updated review', photo: '', order: 999 },
      validate: (r) => r.body && r.body.rating === 4 ? true : 'Update not reflected'
    });

    await test('DELETE /testimonials/:id (delete)', 'DELETE', `/testimonials/${testimonialId}`, 200, { useToken: true });
  }

  /* ── 9. FAQs ─────────────────────────────────────── */
  console.log('\n─── FAQs ──────────────────────────────────────────────');

  await test('GET /faqs', 'GET', '/faqs', 200, {
    validate: (r) => Array.isArray(r.body) && r.body.length > 0 ? true : 'Empty array'
  });

  let fCreateRes = await test('POST /faqs (create)', 'POST', '/faqs', 201, {
    useToken: true,
    body: { question: 'Smoke test question?', answer: 'Smoke test answer.', order: 999 },
    validate: (r) => r.body && r.body._id ? true : 'No _id returned'
  });
  const faqId = fCreateRes.body?._id;

  // Missing required fields
  await test('POST /faqs (missing answer → 400)', 'POST', '/faqs', 400, {
    useToken: true,
    body: { question: 'No answer?' }
  });

  if (faqId) {
    await test('PUT /faqs/:id (update)', 'PUT', `/faqs/${faqId}`, 200, {
      useToken: true,
      body: { question: 'Updated question?', answer: 'Updated answer.', order: 999 },
      validate: (r) => r.body && r.body.question === 'Updated question?' ? true : 'Update not reflected'
    });

    await test('POST /faqs/reorder', 'POST', '/faqs/reorder', 200, {
      useToken: true,
      body: { order: [{ id: faqId, order: 0 }] }
    });

    await test('DELETE /faqs/:id (delete)', 'DELETE', `/faqs/${faqId}`, 200, { useToken: true });
  }

  /* ── 10. Contact Form ────────────────────────────── */
  console.log('\n─── Contact Form ──────────────────────────────────────');

  // Missing required fields
  await test('POST /contact (missing fields → 400)', 'POST', '/contact', 400, {
    body: { name: 'Test' }
  });

  // Valid contact (may fail if SMTP not configured, so accept 200 or 500)
  const contactRes = await req('POST', '/contact', {
    name: 'Smoke Test',
    email: 'test@example.com',
    phone: '+91-9999999999',
    message: 'This is a test message from the smoke test script.'
  });
  if (contactRes.status === 200) {
    log('POST /contact (valid → 200)', 200, 200, true, 'Email sent successfully');
  } else {
    log('POST /contact (SMTP may be unconfigured)', contactRes.status, 200, false,
      `Expected 200, got ${contactRes.status} — ${contactRes.body?.message || 'SMTP error'}`);
  }

  /* ── 11. 404 / Unknown Routes ────────────────────── */
  console.log('\n─── Edge Cases ────────────────────────────────────────');

  await test('GET /nonexistent (404)', 'GET', '/nonexistent', 404);

  await test('PUT /services/000000000000000000000000 (non-existent ID → 404)', 'PUT', '/services/000000000000000000000000', 404, {
    useToken: true,
    body: { title: 'Test' }
  });

  await test('DELETE /faqs/000000000000000000000000 (non-existent ID → 404)', 'DELETE', '/faqs/000000000000000000000000', 404, {
    useToken: true
  });

  /* ── Summary ─────────────────────────────────────── */
  printSummary();
}

function printSummary() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('════════════════════════════════════════════��══════════');
  console.log(`  ✅  Passed: ${passed}`);
  console.log(`  ❌  Failed: ${failed}`);
  console.log(`  📊  Total:  ${passed + failed}`);
  console.log(`  📈  Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n  ⚠️  Failed tests:');
    results.filter(r => !r.ok).forEach(r => {
      console.log(`     • ${r.name}`);
    });
  }

  console.log('\n═══════════════════════════════════════════════════════\n');
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

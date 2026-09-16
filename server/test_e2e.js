const API = 'http://localhost:5000/api';

async function request(url, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${method} ${url}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function runE2ETest() {
  console.log('🚀 Starting Full FoodRescue End-to-End Workflow Verification...\n');
  const ts = Date.now();

  try {
    // ── 1. Register a Donor ──────────────────────────────────
    console.log('1️⃣  Registering Food Donor...');
    const donorReg = await request(`${API}/auth/register`, 'POST', {
      name: 'Grand Hyatt Buffet',
      email: `donor_${ts}@test.com`,
      password: 'password123',
      role: 'donor',
      phone: '+91 98765 43210',
      donorType: 'Hotel / Restaurant',
      address: '77 Residency Road',
      city: 'Hyderabad',
      pincode: '500001',
    });
    const donorToken = donorReg.data.token;
    console.log('   ✅ Donor registered:', donorReg.data.user.email);

    // ── 2. Profile Fetch ─────────────────────────────────────
    console.log('\n2️⃣  Testing Profile Retrieval...');
    const profileRes = await request(`${API}/auth/me`, 'GET', null, donorToken);
    const profile = profileRes.data.user;
    console.log('   ✅ Profile loaded:', { name: profile.name, role: profile.role, city: profile.location?.city });

    // ── 3. Donor Posts Surplus Food ──────────────────────────
    console.log('\n3️⃣  Posting Surplus Food Donation...');
    const donationRes = await request(`${API}/donations`, 'POST', {
      title: 'Vegetable Biryani & Paneer Curry',
      foodName: 'Vegetable Biryani & Paneer Curry',
      description: 'Fresh surplus from lunch catering. Sealed in food-grade trays.',
      foodType: 'Cooked food',
      foodCategory: 'Cooked food',
      dietaryType: 'Vegetarian',
      quantity: 60,
      quantityUnit: 'servings',
      unit: 'servings',
      servings: 60,
      preparedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      pickupDeadline: new Date(Date.now() + 6 * 3600000).toISOString(),
      availableUntil: new Date(Date.now() + 6 * 3600000).toISOString(),
      address: '77 Residency Road, Banquet Hall B',
      city: 'Hyderabad',
      pincode: '500001',
      pickupInstructions: 'Enter via service gate 3.',
      safetyConfirmed: true,
      images: ['https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800'],
    }, donorToken);
    const donation = donationRes.data.donation || donationRes.data;
    const donationId = donation._id;
    console.log('   ✅ Donation posted — ID:', donationId);

    // ── 4. Admin Verifies the Donation ──────────────────────
    console.log('\n4️⃣  Admin Registration & Donation Verification...');
    const adminReg = await request(`${API}/auth/register`, 'POST', {
      name: 'Super Admin',
      email: `admin_${ts}@foodrescue.org`,
      password: 'password123',
      role: 'admin',
      phone: '+91 99999 00000',
    });
    const adminToken = adminReg.data.token;
    const verifyRes = await request(`${API}/admin/donations/${donationId}/verify`, 'PATCH', {}, adminToken);
    const verifiedDonation = verifyRes.data.donation || verifyRes.data;
    console.log('   ✅ Admin verified donation. Status:', verifiedDonation.status, '| Verification:', verifiedDonation.verificationStatus);

    // ── 5. Register NGO, Verify NGO, Claim Donation ─────────
    console.log('\n5️⃣  Registering NGO, Admin Verification, & Claiming Donation...');
    const ngoReg = await request(`${API}/auth/register`, 'POST', {
      name: 'Hope Foundation Shelter',
      email: `ngo_${ts}@test.com`,
      password: 'password123',
      role: 'ngo',
      phone: '+91 88888 11111',
      organizationName: 'Hope Foundation Child Shelter',
      registrationNumber: 'NGO-HYD-2024-998',
      contactPerson: 'Sister Mary',
      address: '12 Care Lane, Begumpet',
      city: 'Hyderabad',
      pincode: '500016',
    });
    const ngoToken = ngoReg.data.token;
    const ngoUserId = ngoReg.data.user._id;

    // Admin verifies the NGO
    await request(`${API}/admin/users/${ngoUserId}/verify`, 'PATCH', {}, adminToken);
    console.log('   ✅ NGO verified by Admin');

    // NGO favorites the donation
    await request(`${API}/favorites/${donationId}`, 'POST', {}, ngoToken);
    console.log('   ✅ NGO saved donation to favorites');

    // NGO claims the donation
    const claimRes = await request(`${API}/claims`, 'POST', {
      donationId: donationId,
      notes: 'We can distribute to 60 children for dinner.',
    }, ngoToken);
    const pickupId = claimRes.data.pickupId;
    console.log('   ✅ Donation claimed! Pickup created — ID:', pickupId);

    // ── 6. Register Volunteer & Accept Pickup ───────────────
    console.log('\n6️⃣  Registering Volunteer & Accepting Pickup Task...');
    const volReg = await request(`${API}/auth/register`, 'POST', {
      name: 'Ravi Kumar',
      email: `vol_${ts}@test.com`,
      password: 'password123',
      role: 'volunteer',
      phone: '+91 77777 22222',
      availability: 'Weekdays & Evenings',
      city: 'Hyderabad',
    });
    const volToken = volReg.data.token;

    // Volunteer assigns themselves to the pickup
    const assignRes = await request(`${API}/pickups/${pickupId}/assign`, 'PATCH', {}, volToken);
    const assignedPickup = assignRes.data.pickup || assignRes.data;
    console.log('   ✅ Volunteer assigned! Status:', assignedPickup.status);

    // ── 7. Donor Generates Secure QR Token ──────────────────
    console.log('\n7️⃣  Donor Generating Secure QR Code Token...');
    const qrGenRes = await request(`${API}/pickups/${pickupId}/generate-qr`, 'POST', {}, donorToken);
    const secureToken = qrGenRes.data.secureToken;
    console.log('   ✅ QR token generated:', secureToken.substring(0, 12) + '...');

    // ── 8. Volunteer Verifies QR Code ───────────────────────
    console.log('\n8️⃣  Volunteer Verifying Scanned QR Code...');
    const qrVerifyRes = await request(`${API}/pickups/${pickupId}/verify-qr`, 'POST', { secureToken }, volToken);
    console.log('   ✅ QR verified!', { verified: qrVerifyRes.data.verified, foodName: qrVerifyRes.data.foodName });

    // ── 9. Volunteer Confirms Pickup with Proof Photo ───────
    console.log('\n9️⃣  Volunteer Confirming Pickup with Proof Photo...');
    const pickedUpRes = await request(`${API}/pickups/${pickupId}/picked-up`, 'PATCH', {
      pickupProofPhoto: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800',
    }, volToken);
    const pickedUpPickup = pickedUpRes.data.pickup || pickedUpRes.data;
    console.log('   ✅ Food Picked Up! Status:', pickedUpPickup.status);

    // ── 10. Volunteer Marks Delivered with Delivery Proof ────
    console.log('\n🔟  Volunteer Delivering to NGO with Proof Photo...');
    const deliveredRes = await request(`${API}/pickups/${pickupId}/delivered`, 'PATCH', {
      deliveryProofPhoto: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
    }, volToken);
    const deliveredPickup = deliveredRes.data.pickup || deliveredRes.data;
    console.log('   ✅ Food Delivered! Status:', deliveredPickup.status);

    // ── 11. NGO Confirms Receipt ────────────────────────────
    console.log('\n1️⃣1️⃣ NGO Confirming Food Receipt...');
    const completedRes = await request(`${API}/pickups/${pickupId}/confirm-receipt`, 'PATCH', {}, ngoToken);
    const completedPickup = completedRes.data.pickup || completedRes.data;
    console.log('   ✅ Rescue Completed! Status:', completedPickup.status);

    // ── 12. Fetch Completion Certificate ────────────────────
    console.log('\n1️⃣2️⃣ Generating Digital Rescue Certificate...');
    const certRes = await request(`${API}/pickups/${pickupId}/certificate`, 'GET', null, donorToken);
    const cert = certRes.data.certificate || certRes.data;
    console.log('   ✅ Certificate generated:', {
      id: cert.certificateId,
      food: cert.foodName,
      donor: cert.donorName,
      ngo: cert.ngoName,
      volunteer: cert.volunteerName,
    });

    // ── 13. Platform Impact Statistics ──────────────────────
    console.log('\n1️⃣3️⃣ Checking Platform Impact Metrics...');
    const impactRes = await request(`${API}/analytics/platform`);
    console.log('   ✅ Platform Analytics:', impactRes.data);

    console.log('\n══════════════════════════════════════════════');
    console.log('🎉 ALL 13 END-TO-END WORKFLOW STAGES PASSED! 🎊');
    console.log('══════════════════════════════════════════════\n');
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    process.exit(1);
  }
}

runE2ETest();

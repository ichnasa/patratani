/**
 * Patra Tani — Real Demo Database Seeder for Supabase
 *
 * Populates all tables with authentic, realistic data matching the
 * MVP Use Case specification (UC-01 through UC-14):
 * - 3 Farmers (Pak Mulyono, Kang Rizal, Pak Wayan)
 * - 3 Buyers (Warung Bu Lina, Resto Dapur Sunda, Cafe Kopi Lembang)
 * - 1 Platform Admin (Admin Pengawas Escrow)
 * - Credentials (password: "password123" for all users)
 * - Farmer Delivery Configurations (Self-pickup vs Farmer Delivery with fixed fee)
 * - Market Posts: 5 Etalase Panen (Pre-Order) & 3 Tender Permintaan (Bidding)
 * - Bids & Pre-Orders
 * - 4 Live Demo Orders across the 7-state machine:
 *   1. HANDOVER (Today's urgent physical delivery & webcam weigh-in)
 *   2. COMPLETED (Success story with geotagged photo, payouts & 5-star reviews)
 *   3. DISPUTED (Open discrepancy case for Admin mediation demo)
 *   4. PAID_HELD (Escrow locked, awaiting H-1 readiness confirmation)
 * - Handover Evidence with GPS coordinates & photo
 * - Open Dispute record with buyer claim text
 * - Dual-party Rating & Reviews
 * - Wallet & Platform Commission Transactions
 */

import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { hashPassword } from "better-auth/crypto";
import postgres from "postgres";

const connString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connString) {
  console.error("DATABASE_URL or DIRECT_URL is not configured.");
  process.exit(1);
}

const sql = postgres(connString, { max: 1 });

async function seed() {
  console.log("🌱 Starting Patra Tani Demo Database Seeder...");

  const defaultPasswordHash = await hashPassword("password123");
  const now = new Date();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const inTwoDays = new Date(Date.now() + 48 * 60 * 60 * 1000);
  const inThreeDays = new Date(Date.now() + 72 * 60 * 60 * 1000);

  // 1. Clean existing records in reverse dependency order
  console.log("🧹 Cleaning existing demo tables...");
  await sql`delete from wallet_transactions`;
  await sql`delete from reviews`;
  await sql`delete from disputes`;
  await sql`delete from handover_evidences`;
  await sql`delete from orders`;
  await sql`delete from bids`;
  await sql`delete from market_posts`;
  await sql`delete from farmer_delivery_configs`;
  await sql`delete from sessions`;
  await sql`delete from accounts`;
  await sql`delete from users`;

  // 2. Insert Users
  console.log("👤 Seeding Users & Accounts (Petani, Pembeli UMKM, Admin)...");
  const usersData = [
    {
      id: "usr_farmer_mulyono",
      name: "Pak Mulyono",
      email: "petani@patratani.com",
      role: "FARMER",
      businessName: "Kelompok Tani Subur",
      phone: "+62 813-8822-1100",
      address: "Jl. Pasirjambu No. 14, Ciwidey, Kabupaten Bandung",
      latitude: -6.860451,
      longitude: 107.589923,
      image: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80",
      walletBalanceIdr: 1450000,
      ratingAvg: 4.9,
      ratingCount: 68,
    },
    {
      id: "usr_farmer_rizal",
      name: "Kang Rizal Firmansyah",
      email: "rizal@patratani.com",
      role: "FARMER",
      businessName: "Sentra Tani Baros",
      phone: "+62 812-9988-7711",
      address: "Sentra Tani Baros, Lembang, Bandung Barat",
      latitude: -6.8152,
      longitude: 107.6185,
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      walletBalanceIdr: 4250000,
      ratingAvg: 4.9,
      ratingCount: 148,
    },
    {
      id: "usr_farmer_wayan",
      name: "Pak Wayan Sudirga",
      email: "wayan@patratani.com",
      role: "FARMER",
      businessName: "Kebun Berkah Lembang",
      phone: "+62 812-3344-5566",
      address: "Jl. Kolonel Masturi No. 88, Lembang",
      latitude: -6.821,
      longitude: 107.625,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      walletBalanceIdr: 980000,
      ratingAvg: 4.8,
      ratingCount: 42,
    },
    {
      id: "usr_buyer_lina",
      name: "Ibu Lina Marlina",
      email: "pembeli@patratani.com",
      role: "BUYER",
      businessName: "Warung Sederhana Bu Lina",
      phone: "+62 812-3456-7890",
      address: "Jl. Terusan Buahbatu No. 42, Batununggal, Kota Bandung",
      latitude: -6.9421,
      longitude: 107.6358,
      image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&auto=format&fit=crop&q=80",
      walletBalanceIdr: 0,
      ratingAvg: 4.9,
      ratingCount: 92,
    },
    {
      id: "usr_buyer_dapur_sunda",
      name: "H. Asep Ridwan",
      email: "dapur@sundaasli.com",
      role: "BUYER",
      businessName: "Resto Dapur Sunda Asli",
      phone: "+62 811-2233-4455",
      address: "Jl. LLRE Martadinata (Riau) No. 18, Bandung",
      latitude: -6.9075,
      longitude: 107.6186,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
      walletBalanceIdr: 0,
      ratingAvg: 5.0,
      ratingCount: 34,
    },
    {
      id: "usr_buyer_cafe_lembang",
      name: "Dimas Pratama",
      email: "kopi@lembang.com",
      role: "BUYER",
      businessName: "Cafe Kopi Lembang",
      phone: "+62 819-7788-9900",
      address: "Jl. Raya Lembang No. 108, Lembang",
      latitude: -6.818,
      longitude: 107.617,
      image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80",
      walletBalanceIdr: 0,
      ratingAvg: 4.7,
      ratingCount: 19,
    },
    {
      id: "usr_admin_pengawas",
      name: "Admin Pengawas Escrow",
      email: "admin@patratani.com",
      role: "ADMIN",
      businessName: "Patra Tani Pusat Mediasi",
      phone: "+62 888-0000-1111",
      address: "Sentra Inovasi Agrikultur, Kota Bandung",
      latitude: -6.9147,
      longitude: 107.6098,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
      walletBalanceIdr: 0,
      ratingAvg: 5.0,
      ratingCount: 120,
    },
  ];

  for (const u of usersData) {
    await sql`
      insert into users (
        id, name, email, email_verified, image, role, business_name, phone, address, latitude, longitude, wallet_balance_idr, rating_avg, rating_count, created_at, updated_at
      ) values (
        ${u.id}, ${u.name}, ${u.email}, true, ${u.image}, ${u.role}, ${u.businessName}, ${u.phone}, ${u.address}, ${u.latitude}, ${u.longitude}, ${u.walletBalanceIdr}, ${u.ratingAvg}, ${u.ratingCount}, ${threeDaysAgo}, ${now}
      )
    `;

    // Corresponding Better Auth credential account
    await sql`
      insert into accounts (
        id, account_id, provider_id, user_id, password, created_at, updated_at
      ) values (
        ${"acc_" + u.id}, ${u.id}, 'credential', ${u.id}, ${defaultPasswordHash}, ${threeDaysAgo}, ${now}
      )
    `;
  }

  // 3. Farmer Delivery Configurations (UC-02)
  console.log("🚚 Seeding Farmer Delivery Configurations...");
  await sql`
    insert into farmer_delivery_configs (
      user_id, is_delivery_enabled, min_capacity_kg, max_capacity_kg, max_radius_km, fixed_delivery_fee_idr, updated_at
    ) values 
      ('usr_farmer_mulyono', true, 10, 80, 25, 15000, ${now}),
      ('usr_farmer_rizal', true, 10, 100, 30, 15000, ${now}),
      ('usr_farmer_wayan', false, null, null, null, null, ${now})
  `;

  // 4. Market Posts (UC-03 & UC-04)
  console.log("🌾 Seeding Market Posts (Etalase Panen & Tender Permintaan)...");
  
  // Etalase 1: Tomat Mawar Segar (Pak Mulyono)
  const [postEtalaseTomat] = await sql`
    insert into market_posts (
      creator_id, type, title, commodity_name, category, description, image_urls,
      address, latitude, longitude, total_quota_kg, remaining_quota_kg, min_order_kg,
      price_per_kg_idr, harvest_or_needed_date, is_open, created_at
    ) values (
      'usr_farmer_mulyono', 'ETALASE_PANEN', 'Tomat Mawar Organik Segar', 'Tomat Mawar Segar', 'SAYURAN',
      'Tomat mawar pilihan hasil budidaya kebun organik Pasirjambu Ciwidey. Ditanam tanpa pestisida kimia sintetis, bertekstur padat renyah dengan rasa asam-segar seimbang. Sangat cocok untuk sambal, saus, dan sup resto kuliner.',
      ARRAY['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1546470427-e26264be0b11?w=800&auto=format&fit=crop&q=80'],
      'Desa Pasirjambu, Ciwidey, Kabupaten Bandung', -6.860451, 107.589923,
      50, 30, 10, 12000, ${inTwoDays}, true, ${threeDaysAgo}
    ) returning id
  `;

  // Etalase 2: Cabai Rawit Merah (Kang Rizal)
  const [postEtalaseCabai] = await sql`
    insert into market_posts (
      creator_id, type, title, commodity_name, category, description, image_urls,
      address, latitude, longitude, total_quota_kg, remaining_quota_kg, min_order_kg,
      price_per_kg_idr, harvest_or_needed_date, is_open, created_at
    ) values (
      'usr_farmer_rizal', 'ETALASE_PANEN', 'Cabai Rawit Merah Domba Grade Super', 'Cabai Rawit Merah', 'CABAI_BAWANG',
      'Cabai rawit domba merah menyala kualitas super dari kebun Baros Lembang. Tingkat kepedasan tinggi dan tahan simpan hingga 7 hari. Siap panen langsung petik segar sesuai pesanan.',
      ARRAY['https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop&q=80'],
      'Sentra Tani Baros, Lembang, Bandung Barat', -6.8152, 107.6185,
      40, 25, 10, 48000, ${inThreeDays}, true, ${twoDaysAgo}
    ) returning id
  `;

  // Etalase 3: Pisang Kepok Kuning (Pak Mulyono)
  const [postEtalasePisang] = await sql`
    insert into market_posts (
      creator_id, type, title, commodity_name, category, description, image_urls,
      address, latitude, longitude, total_quota_kg, remaining_quota_kg, min_order_kg,
      price_per_kg_idr, harvest_or_needed_date, is_open, created_at
    ) values (
      'usr_farmer_mulyono', 'ETALASE_PANEN', 'Pisang Kepok Kuning Matang Pohon', 'Pisang Kepok Kuning', 'BUAH',
      'Pisang kepok kuning matang alami di pohon, daging padat manis legit tidak berlendir. Sangat dicari untuk pisang goreng crispy, olahan kolak, dan jajanan kafe tradisional.',
      ARRAY['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&auto=format&fit=crop&q=80'],
      'Desa Pasirjambu, Ciwidey, Kabupaten Bandung', -6.860451, 107.589923,
      60, 20, 10, 20000, ${tomorrow}, true, ${twoDaysAgo}
    ) returning id
  `;

  // Etalase 4: Bawang Merah Brebes (Kang Rizal)
  const [postEtalaseBawang] = await sql`
    insert into market_posts (
      creator_id, type, title, commodity_name, category, description, image_urls,
      address, latitude, longitude, total_quota_kg, remaining_quota_kg, min_order_kg,
      price_per_kg_idr, harvest_or_needed_date, is_open, created_at
    ) values (
      'usr_farmer_rizal', 'ETALASE_PANEN', 'Bawang Merah Brebes Pilihan', 'Bawang Merah Brebes', 'CABAI_BAWANG',
      'Bawang merah varietas Brebes berumbi padat dan beraroma wangi kuat saat ditumis. Sudah kering jemur sempurna, bebas jamur busuk.',
      ARRAY['https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80'],
      'Sentra Tani Baros, Lembang, Bandung Barat', -6.8152, 107.6185,
      50, 25, 10, 32000, ${inThreeDays}, true, ${twoDaysAgo}
    ) returning id
  `;

  // Tender 1: Kebutuhan Tomat Merah (Bu Lina)
  const [postTenderTomat] = await sql`
    insert into market_posts (
      creator_id, type, title, commodity_name, category, description, image_urls,
      address, latitude, longitude, total_quota_kg, remaining_quota_kg, min_order_kg,
      price_per_kg_idr, harvest_or_needed_date, bidding_deadline, is_open, created_at
    ) values (
      'usr_buyer_lina', 'TENDER_PERMINTAAN', 'Kebutuhan Tomat Merah Segar (20 kg)', 'Tomat Merah Segar', 'SAYURAN',
      'Kebutuhan pasokan rutin dapur warung makan: Tomat merah ranum 20 kg untuk sambal dan sop. Butuh diantar pagi hari sebelum jam 08.00 WIB.',
      ARRAY['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800'],
      'Jl. Terusan Buahbatu No. 42, Batununggal, Bandung', -6.9421, 107.6358,
      20, 20, 20, 14000, ${inTwoDays}, ${tomorrow}, true, ${yesterday}
    ) returning id
  `;

  // Tender 2: Kebutuhan Cabai Rawit (Dapur Sunda)
  const [postTenderCabai] = await sql`
    insert into market_posts (
      creator_id, type, title, commodity_name, category, description, image_urls,
      address, latitude, longitude, total_quota_kg, remaining_quota_kg, min_order_kg,
      price_per_kg_idr, harvest_or_needed_date, bidding_deadline, is_open, created_at
    ) values (
      'usr_buyer_dapur_sunda', 'TENDER_PERMINTAAN', 'Cabai Rawit Merah Kualitas Super (15 kg)', 'Cabai Rawit Merah', 'CABAI_BAWANG',
      'Dibutuhkan cabai rawit merah petik segar tanpa tangkai busuk untuk resto kuliner Sunda. Wajib lolos timbangan bersih saat serah terima.',
      ARRAY['https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800'],
      'Jl. LLRE Martadinata (Riau) No. 18, Bandung', -6.9075, 107.6186,
      15, 15, 15, 50000, ${inThreeDays}, ${inTwoDays}, true, ${yesterday}
    ) returning id
  `;

  // Tender 3: Pengadaan Pisang Kepok Kuning Tua (Resto Dapur Sunda - Awarded & Locked into Order 1)
  const [postTenderPisangAwarded] = await sql`
    insert into market_posts (
      creator_id, type, title, commodity_name, category, description, image_urls,
      address, latitude, longitude, total_quota_kg, remaining_quota_kg, min_order_kg,
      price_per_kg_idr, harvest_or_needed_date, bidding_deadline, is_open, created_at
    ) values (
      'usr_buyer_dapur_sunda', 'TENDER_PERMINTAAN', 'Pengadaan Pisang Kepok Kuning Tua (40 kg)', 'Pisang Kepok Kuning', 'BUAH',
      'Kebutuhan bahan pisang goreng keju crispy menu andalan resto. Butuh pisang kepok tua matang pohon ukuran seragam 40 kg.',
      ARRAY['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800'],
      'Jl. LLRE Martadinata (Riau) No. 18, Bandung', -6.9075, 107.6186,
      40, 0, 40, 20000, ${now}, ${yesterday}, false, ${twoDaysAgo}
    ) returning id
  `;

  // 5. Bids & Pre-Orders (UC-06 & UC-07)
  console.log("📝 Seeding Bids & Pre-Orders...");
  
  // Pending Bids on Tender 1
  await sql`
    insert into bids (
      post_id, bidder_id, weight_kg, offered_price_per_kg_idr, delivery_method, delivery_fee_idr,
      delivery_address, distance_km, notes, status, created_at
    ) values 
      (${postTenderTomat.id}, 'usr_farmer_mulyono', 20, 12000, 'FARMER_DELIVERY', 15000, 'Jl. Terusan Buahbatu No. 42, Bandung', 14.5, 'Tomat organik segar petik pagi hari, siap diantar tepat waktu pukul 07.00.', 'PENDING', ${yesterday}),
      (${postTenderTomat.id}, 'usr_farmer_rizal', 20, 13000, 'SELF_PICKUP', 0, null, 18.2, 'Tomat mawar super dari Baros Lembang, silakan diambil di kebun.', 'PENDING', ${yesterday})
  `;

  // Bid 3: Accepted on Tender 3 (leads to Order 1 HANDOVER)
  const [bidHandover] = await sql`
    insert into bids (
      post_id, bidder_id, weight_kg, offered_price_per_kg_idr, delivery_method, delivery_fee_idr,
      delivery_address, distance_km, notes, status, created_at
    ) values (
      ${postTenderPisangAwarded.id}, 'usr_farmer_rizal', 40, 20000, 'SELF_PICKUP', 0,
      null, 12.4, 'Pisang kepok tua sudah disortir tanpa cacat, siap serah terima.', 'ACCEPTED', ${twoDaysAgo}
    ) returning id
  `;

  // Bid 4: Pre-Order on Etalase Tomat (leads to Order 2 COMPLETED)
  const [bidCompleted] = await sql`
    insert into bids (
      post_id, bidder_id, weight_kg, offered_price_per_kg_idr, delivery_method, delivery_fee_idr,
      delivery_address, delivery_latitude, delivery_longitude, distance_km, notes, status, created_at
    ) values (
      ${postEtalaseTomat.id}, 'usr_buyer_lina', 20, 12000, 'FARMER_DELIVERY', 15000,
      'Jl. Terusan Buahbatu No. 42, Bandung', -6.9421, 107.6358, 14.5, 'Pre-order 20 kg tomat untuk warung.', 'ACCEPTED', ${threeDaysAgo}
    ) returning id
  `;

  // Bid 5: Pre-Order on Etalase Tomat (leads to Order 3 DISPUTED)
  const [bidDisputed] = await sql`
    insert into bids (
      post_id, bidder_id, weight_kg, offered_price_per_kg_idr, delivery_method, delivery_fee_idr,
      delivery_address, distance_km, notes, status, created_at
    ) values (
      ${postEtalaseTomat.id}, 'usr_buyer_cafe_lembang', 15, 12000, 'SELF_PICKUP', 0,
      null, 8.2, 'Ambil sendiri di kebun Pasirjambu.', 'ACCEPTED', ${twoDaysAgo}
    ) returning id
  `;

  // Bid 6: Pre-Order on Etalase Bawang (leads to Order 4 PAID_HELD)
  const [bidPaidHeld] = await sql`
    insert into bids (
      post_id, bidder_id, weight_kg, offered_price_per_kg_idr, delivery_method, delivery_fee_idr,
      delivery_address, delivery_latitude, delivery_longitude, distance_km, notes, status, created_at
    ) values (
      ${postEtalaseBawang.id}, 'usr_buyer_lina', 15, 32000, 'FARMER_DELIVERY', 15000,
      'Jl. Terusan Buahbatu No. 42, Bandung', -6.9421, 107.6358, 18.2, 'Pre-order bawang merah 15 kg.', 'ACCEPTED', ${yesterday}
    ) returning id
  `;

  // 6. Orders across 7-state machine (UC-07 through UC-12)
  console.log("📦 Seeding Live Orders (HANDOVER, COMPLETED, DISPUTED, PAID_HELD)...");

  // ORDER 1: HANDOVER (Urgent Today's Delivery Demonstration)
  // Subtotal = 40 * 20.000 = 800.000, Fee = 0, Escrow = 800.000, Comm (4%) = 32.000, Net = 768.000
  const [orderHandover] = await sql`
    insert into orders (
      order_code, post_id, bid_id, farmer_id, buyer_id, status,
      fixed_weight_kg, agreed_price_per_kg_idr, delivery_method,
      subtotal_harvest_idr, delivery_fee_idr, total_escrow_held_idr,
      platform_commission_idr, net_farmer_payout_idr,
      is_h1_confirmed, h1_notes, h1_confirmed_at,
      farmer_confirmed_complete, buyer_confirmed_complete,
      paid_at, created_at
    ) values (
      'PT-20261029-HND1', ${postTenderPisangAwarded.id}, ${bidHandover.id},
      'usr_farmer_rizal', 'usr_buyer_dapur_sunda', 'HANDOVER',
      40, 20000, 'SELF_PICKUP',
      800000, 0, 800000,
      32000, 768000,
      true, 'Stok 40 kg pisang kepok tua matang pohon siap serah terima hari ini.', ${yesterday},
      false, false,
      ${yesterday}, ${twoDaysAgo}
    ) returning id
  `;

  // ORDER 2: COMPLETED (Success Story: Harvest Subtotal 240.000 + 15.000 Delivery Fee = 255.000 Escrow)
  // Commission (4% of 240.000) = 9.600, Net Payout = 240.000 - 9.600 + 15.000 = 245.400
  const [orderCompleted] = await sql`
    insert into orders (
      order_code, post_id, bid_id, farmer_id, buyer_id, status,
      fixed_weight_kg, agreed_price_per_kg_idr, delivery_method,
      subtotal_harvest_idr, delivery_fee_idr, total_escrow_held_idr,
      platform_commission_idr, net_farmer_payout_idr,
      is_h1_confirmed, h1_notes, h1_confirmed_at,
      farmer_confirmed_complete, buyer_confirmed_complete,
      paid_at, completed_at, created_at
    ) values (
      'PT-20261026-CMP1', ${postEtalaseTomat.id}, ${bidCompleted.id},
      'usr_farmer_mulyono', 'usr_buyer_lina', 'COMPLETED',
      20, 12000, 'FARMER_DELIVERY',
      240000, 15000, 255000,
      9600, 245400,
      true, 'Panen tomat siap 20 kg pas.', ${threeDaysAgo},
      true, true,
      ${threeDaysAgo}, ${yesterday}, ${threeDaysAgo}
    ) returning id
  `;

  // ORDER 3: DISPUTED (Discrepancy Case for Admin Mediation)
  // Subtotal = 15 * 12.000 = 180.000, Delivery = 0, Escrow = 180.000, Comm = 7.200, Net = 172.800
  const [orderDisputed] = await sql`
    insert into orders (
      order_code, post_id, bid_id, farmer_id, buyer_id, status,
      fixed_weight_kg, agreed_price_per_kg_idr, delivery_method,
      subtotal_harvest_idr, delivery_fee_idr, total_escrow_held_idr,
      platform_commission_idr, net_farmer_payout_idr,
      is_h1_confirmed, h1_notes, h1_confirmed_at,
      farmer_confirmed_complete, buyer_confirmed_complete,
      paid_at, created_at
    ) values (
      'PT-20261027-DSP1', ${postEtalaseTomat.id}, ${bidDisputed.id},
      'usr_farmer_mulyono', 'usr_buyer_cafe_lembang', 'DISPUTED',
      15, 12000, 'SELF_PICKUP',
      180000, 0, 180000,
      7200, 172800,
      true, 'Tomat siap ditimbang di kebun.', ${twoDaysAgo},
      false, false,
      ${twoDaysAgo}, ${twoDaysAgo}
    ) returning id
  `;

  // ORDER 4: PAID_HELD (Escrow Secured, Awaiting H-1 Confirmation)
  // Subtotal = 15 * 32.000 = 480.000, Delivery = 15.000, Escrow = 495.000, Comm = 19.200, Net = 475.800
  await sql`
    insert into orders (
      order_code, post_id, bid_id, farmer_id, buyer_id, status,
      fixed_weight_kg, agreed_price_per_kg_idr, delivery_method,
      subtotal_harvest_idr, delivery_fee_idr, total_escrow_held_idr,
      platform_commission_idr, net_farmer_payout_idr,
      is_h1_confirmed, farmer_confirmed_complete, buyer_confirmed_complete,
      paid_at, created_at
    ) values (
      'PT-20261028-PAID', ${postEtalaseBawang.id}, ${bidPaidHeld.id},
      'usr_farmer_rizal', 'usr_buyer_lina', 'PAID_HELD',
      15, 32000, 'FARMER_DELIVERY',
      480000, 15000, 495000,
      19200, 475800,
      null, false, false,
      ${now}, ${yesterday}
    )
  `;

  // 7. Handover Evidence with GPS & Photo (UC-10)
  console.log("📸 Seeding Handover Evidence with Geotag...");
  await sql`
    insert into handover_evidences (
      order_id, uploaded_by_user_id, uploaded_by_role, storage_path, photo_url,
      captured_latitude, captured_longitude, captured_at, created_at
    ) values (
      ${orderCompleted.id}, 'usr_farmer_mulyono', 'FARMER',
      'evidence/PT-20261026-CMP1/serah_terima_timbangan.jpg',
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
      -6.860451, 107.589923, ${yesterday}, ${yesterday}
    )
  `;

  // 8. Dispute Case (UC-12)
  console.log("⚖️ Seeding Open Dispute for Admin Mediation...");
  await sql`
    insert into disputes (
      order_id, opened_by_user_id, reason, evidence_urls, resolution, admin_notes, created_at
    ) values (
      ${orderDisputed.id}, 'usr_buyer_cafe_lembang',
      'Hasil timbangan di tempat hanya 11.5 kg (kurang 3.5 kg dari kuota pesanan 15 kg). Sebagian tomat pecah berair.',
      ARRAY['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800'],
      null, null, ${yesterday}
    )
  `;

  // 9. Ratings & Reviews (UC-13)
  console.log("⭐ Seeding Ratings & Reviews...");
  await sql`
    insert into reviews (
      order_id, reviewer_id, reviewee_id, rating, comment, created_at
    ) values 
      (
        ${orderCompleted.id}, 'usr_buyer_lina', 'usr_farmer_mulyono', 5,
        'Tomat mawar sangat segar, dipetik pagi hari dan timbangan pas 20 kg di depan dapur. Sangat puas berlangganan langsung ke Pak Mulyono!',
        ${yesterday}
      ),
      (
        ${orderCompleted.id}, 'usr_farmer_mulyono', 'usr_buyer_lina', 5,
        'Pembayaran escrow langsung cair setelah serah terima selesai. Bu Lina sangat ramah dan kooperatif!',
        ${yesterday}
      )
  `;

  // 10. Ledger / Wallet Transactions (UC-11 & UC-14)
  console.log("💰 Seeding Wallet & Platform Commission Ledger...");
  await sql`
    insert into wallet_transactions (
      user_id, order_id, type, amount_idr, description, created_at
    ) values 
      (
        'usr_farmer_mulyono', ${orderCompleted.id}, 'PAYOUT_RELEASE', 245400,
        'Pencairan dana pesanan selesai #PT-20261026-CMP1 (Hasil Panen - Komisi 4% + 100% Ongkir)',
        ${yesterday}
      ),
      (
        null, ${orderCompleted.id}, 'PLATFORM_COMMISSION', 9600,
        'Komisi platform 4% untuk transaksi #PT-20261026-CMP1',
        ${yesterday}
      )
  `;

  console.log("\n✅ Patra Tani Demo Database Seeding COMPLETED successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Demo Accounts (Password for all: password123):");
  console.log("  • Petani Mitra   : petani@patratani.com (Pak Mulyono)");
  console.log("  • Petani Baros   : rizal@patratani.com (Kang Rizal)");
  console.log("  • Pembeli UMKM   : pembeli@patratani.com (Ibu Lina Marlina)");
  console.log("  • Pembeli HoReCa : dapur@sundaasli.com (Resto Dapur Sunda)");
  console.log("  • Admin Escrow   : admin@patratani.com (Admin Pengawas)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  await sql.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed with error:", err);
  process.exit(1);
});

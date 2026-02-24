# Student Welfare Fund – API Documentation (Web & Mobile)

This document lists all API endpoints for use by **web** and mobile clients. Use it together with the detailed specs: [RBAC_FRONTEND_SPEC.md](RBAC_FRONTEND_SPEC.md) (admin) and [PHONE_VERIFICATION_DOCUMENTATION.md](PHONE_VERIFICATION_DOCUMENTATION.md) (phone auth).

---

## 1. Base URL and usage from web

- **Base URL:** All endpoints are under the `/api` prefix.
  - Example: `https://your-backend-domain.com/api`
  - Local: `http://localhost:8000/api` or `http://127.0.0.1:8000/api`
- **CORS:** Enabled for `api/*` and `sanctum/csrf-cookie`. Allowed origins include `http://localhost:5173`, `http://127.0.0.1:5173`, and production web domains (see `config/cors.php`). Credentials are supported.
- **Auth (web):** Use **Bearer token** (Laravel Sanctum) in the `Authorization` header: `Authorization: Bearer <token>`.
- **Content-Type:** Send JSON with `Content-Type: application/json` and `Accept: application/json` where applicable.
- **Client source (web vs app):** Optional. Backend distinguishes donations/payments by source. Send in either or both ways; if both are present, **body** overrides **header**.
  - **Header:** `X-Client-Source: web` or `X-Client-Source: app`
  - **Body:** `"source": "web"` or `"source": "app"` in JSON (for donation and payment create endpoints). If omitted, backend defaults to `web`.

---

## 2. Authentication (public – no token)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register with email/phone (legacy) |
| POST | `/api/auth/register/phone` | Register with phone, send OTP – see [PHONE_VERIFICATION_DOCUMENTATION.md](PHONE_VERIFICATION_DOCUMENTATION.md) |
| POST | `/api/auth/verify/phone/otp` | Verify OTP, complete registration (returns token) |
| POST | `/api/auth/resend-otp` | Resend OTP for existing phone |
| GET | `/api/auth/dev/otp` | **(Dev only)** Get OTP by `verifyId` when `APP_ENV=local` |
| POST | `/api/auth/login` | Login (email/phone + password) |

---

## 3. Authenticated user (Bearer token required)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/auth/me` | Current user profile |
| POST | `/api/auth/logout` | Logout (invalidate token) |
| GET | `/api/user` | Current user (Laravel default) |

---

## 4. Public catalog & content (no auth)

All under `/api/v1/`:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/categories` | List categories |
| GET | `/api/v1/programs` | List programs |
| GET | `/api/v1/programs/support` | Support programs |
| GET | `/api/v1/programs/{id}` | Program by ID |
| GET | `/api/v1/donations/recent` | Recent donations |
| GET | `/api/v1/campaigns` | List campaigns |
| GET | `/api/v1/campaigns/urgent` | Urgent campaigns |
| GET | `/api/v1/campaigns/featured` | Featured campaigns |
| GET | `/api/v1/campaigns/{id}` | Campaign by ID |
| GET | `/api/v1/banners` | List banners |
| GET | `/api/v1/banners/featured` | Featured banners |
| GET | `/api/v1/banners/{id}` | Banner by ID |
| GET | `/api/v1/fund-news` | List fund news |
| GET | `/api/v1/fund-news/featured` | Featured fund news |
| GET | `/api/v1/fund-news/{id}` | Fund news by ID |
| GET | `/api/v1/fund-partners` | List fund partners |
| GET | `/api/v1/fund-partners/featured` | Featured fund partners |
| GET | `/api/v1/fund-partners/{id}` | Fund partner by ID |
| GET | `/api/v1/student-registration-card` | Student registration card (public) |
| GET | `/api/v1/settings-pages` | List settings pages |
| GET | `/api/v1/settings-pages/{key}` | Settings page by key |

Legacy (no v1 prefix):

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/settings-pages` | List settings pages |
| GET | `/api/settings-pages/{key}` | Settings page by key |

---

## 5. Donations (public and authenticated)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/donations/with-payment` | No | Donation with payment (logged-in or anonymous) |
| POST | `/api/v1/donations/anonymous` | No | Anonymous donation (no payment) |
| POST | `/api/v1/donations/anonymous-with-payment` | No | Anonymous donation with payment |
| GET | `/api/v1/donations/quick-amounts` | No | Quick amount options |
| GET | `/api/v1/programs/{id}/donations` | No | Donations for a program |
| GET | `/api/v1/donations/{id}` | Yes | Get donation by ID |
| POST | `/api/v1/donations` | Yes | Create donation (logged-in user) |
| POST | `/api/v1/donations/gift` | Yes | Gift donation |
| GET | `/api/v1/donations/{id}/status` | No | Donation/payment status (legacy) |

---

## 6. Payments (Thawani)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/payments/create` | No | Create payment session (throttle: 20/min) |
| POST | `/api/v1/payments/create-with-donation` | No | Create payment linked to donation |
| POST | `/api/v1/payments/confirm` | No | Confirm payment |
| GET | `/api/v1/payments/status/{sessionId}` | No | Get payment status (throttle: 60/min) |
| GET | `/api/v1/payments` | No | List/query payments (e.g. `?session_id=...`) |
| GET | `/api/v1/payments/mobile/success` | No | Mobile success redirect handler |
| GET | `/api/v1/payments/success` | No | Success page (redirect) |
| GET | `/api/v1/payments/cancel` | No | Cancel page (redirect) |
| POST | `/api/v1/payments/webhook/thawani` | No | Thawani webhook (server-to-server) |
| POST | `/api/webhooks/thawani` | No | Thawani webhook (alternate path) |
| GET | `/api/v1/payments/callback` | No | Legacy payment callback |

**Web success flow:** Thawani redirects the user to the backend success URL (e.g. `{APP_URL}/api/v1/payments/success` or `/api/v1/payments/mobile/success`). The backend **must** respond with **HTTP 302 Redirect** to the web app (not JSON), e.g. `{return_origin}/payments/success?donation_id=...&session_id=...&result=success`. If the backend returns JSON, the user will see raw JSON instead of the success page. The web app then shows the success page and calls **POST** `/api/v1/payments/confirm` with `session_id`.

---

## 7. Student registration (Bearer required)

Available at both legacy and v1 paths; prefer v1 for new web clients.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/students/registration` or `/api/students/registration` | Create application |
| GET | `/api/v1/students/registration/my-registration` or `/api/students/registration/my-registration` | Current user's registration |
| GET | `/api/v1/students/registration/{id}` or `/api/students/registration/{id}` | Get by ID |
| PUT | `/api/v1/students/registration/{id}` or `/api/students/registration/{id}` | Update application |
| POST | `/api/v1/students/registration/{id}/documents` or `/api/students/registration/{id}/documents` | Upload documents |

---

## 8. Me – profile and donations (Bearer required)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/me/donations` | My donations |
| GET | `/api/v1/me/donations/{id}` | My donation by ID |
| GET | `/api/v1/me/edit/profile` | Get profile edit form/data |
| PATCH | `/api/v1/me/edit/profile` | Update profile |

---

## 9. FCM and test

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/fcm-token` | Yes | Register FCM token for push |
| GET | `/api/v1/test-push/{id}` or `/api/test-push/{id}` | No | Send test push to token ID (dev) |

---

## 10. Admin portal (RBAC)

**Base path:** `/api/v1/admin`  
**Auth:** `POST /api/v1/admin/auth/login` (no Bearer); all other admin routes require **Bearer token** and **admin portal access** (role `admin` or `reviewer`). Many routes also require a **permission** (see [RBAC_FRONTEND_SPEC.md](RBAC_FRONTEND_SPEC.md)).

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| POST | `/api/v1/admin/auth/login` | — | Admin login |
| POST | `/api/v1/admin/auth/logout` | — | Admin logout |
| GET | `/api/v1/admin/auth/me` | — | Current admin user + permissions |
| GET | `/api/v1/admin/stats` | view_dashboard | Dashboard stats |
| GET | `/api/v1/admin/dashboard` | view_dashboard | Dashboard data |
| GET | `/api/v1/admin/ping` | view_dashboard | Ping |
| GET | `/api/v1/admin/reports/overview` | view_reports | Reports overview |
| GET | `/api/v1/admin/reports/donations` | view_reports | Donations report |
| GET | `/api/v1/admin/reports/donations/export/excel` | view_reports | Donations Excel |
| GET | `/api/v1/admin/reports/donations/export/pdf` | view_reports | Donations PDF |
| GET | `/api/v1/admin/reports/financial` | view_reports | Financial report |
| GET | `/api/v1/admin/reports/financial/export/excel` | view_reports | Financial Excel |
| GET | `/api/v1/admin/reports/financial/export/pdf` | view_reports | Financial PDF |
| GET | `/api/v1/admin/reports/programs` | view_reports | Programs report |
| GET | `/api/v1/admin/reports/programs/export/excel` | view_reports | Programs Excel |
| GET | `/api/v1/admin/reports/campaigns` | view_reports | Campaigns report |
| GET | `/api/v1/admin/reports/applications` | view_reports | Applications report |
| GET | `/api/v1/admin/reports/applications/export/excel` | view_reports | Applications Excel |
| GET | `/api/v1/admin/reports/applications/export/pdf` | view_reports | Applications PDF |
| GET | `/api/v1/admin/reports/users` | view_reports | Users report |
| GET/POST | `/api/v1/admin/categories` | view_categories / create_categories | Categories list / create |
| GET/PUT/DELETE | `/api/v1/admin/categories/{id}` | view_categories / edit_categories / delete_categories | Category by ID |
| GET/POST | `/api/v1/admin/programs` | view_programs / create_programs | Programs list / create |
| GET/PUT/DELETE | `/api/v1/admin/programs/{id}` | view_programs / edit_programs / delete_programs | Program by ID |
| GET/POST/PUT/DELETE | `/api/v1/admin/campaigns`, `.../campaigns/{id}` | manage_campaigns | Campaigns CRUD |
| POST | `/api/v1/admin/upload/image` | manage_campaigns | Campaign image upload |
| GET/POST/PUT/DELETE | `/api/v1/admin/banners`, `.../banners/{id}` | manage_banners | Banners CRUD |
| POST | `/api/v1/admin/banners/upload/image` | manage_banners | Banner image upload |
| GET/POST/PUT/DELETE | `/api/v1/admin/fund-news`, `.../fund-news/{id}` | manage_fund_news | Fund news CRUD |
| POST | `/api/v1/admin/fund-news/upload/image` | manage_fund_news | Fund news image upload |
| GET/POST/PUT/DELETE | `/api/v1/admin/fund-partners`, `.../fund-partners/{id}` | manage_fund_partners | Fund partners CRUD |
| POST | `/api/v1/admin/fund-partners/upload/image` | manage_fund_partners | Fund partner image upload |
| GET/PUT | `/api/v1/admin/student-registration-card` | manage_student_registration_card | Card view/update |
| POST | `/api/v1/admin/student-registration-card/upload-background` | manage_student_registration_card | Card background upload |
| GET | `/api/v1/admin/donations` | view_donations | List donations |
| GET | `/api/v1/admin/applications` | view_applications | List applications |
| GET | `/api/v1/admin/applications/{id}` | view_applications | Application by ID |
| GET | `/api/v1/admin/applications/{id}/documents/{type}` | view_applications | Application document |
| GET | `/api/v1/admin/applications/{id}/id-card-image` | view_applications | ID card image |
| PUT | `/api/v1/admin/applications/{id}/status` | review_applications | Update application status |
| GET/POST/PUT/DELETE | `/api/v1/admin/users`, `.../users/{id}` | manage_users | Users CRUD |
| PUT | `/api/v1/admin/users/{id}/role` | manage_users | Update user role |
| POST | `/api/v1/admin/students/register` | manage_users | Register student (admin) |
| GET/POST/PUT/DELETE | `/api/v1/admin/roles`, `.../roles/{id}` | manage_roles | Roles CRUD |
| GET/POST/PUT/DELETE | `/api/v1/admin/permissions`, `.../permissions/{id}` | manage_permissions | Permissions CRUD |
| GET/POST/PUT | `/api/v1/admin/settings-pages`, `.../settings-pages/{key}` | manage_settings | Settings pages CRUD |
| POST | `/api/v1/admin/send-notification` | send_notifications | Send notification |

---

## 11. Error handling (web)

- **401 Unauthorized:** Missing or invalid token → clear auth and redirect to login.
- **403 Forbidden:** Valid token but not allowed (e.g. not admin, or missing permission) → show “Access denied” or redirect to an allowed page.
- **422 Unprocessable Entity:** Validation errors; body contains `message` and `errors` (field → messages).
- **404 Not Found:** Resource or route not found.
- Always send `Accept: application/json` so the API returns JSON error bodies.

---

## 12. Swagger / OpenAPI

Generated docs are available at **`/api/documentation`** when L5-Swagger is enabled (see `config/l5-swagger.php`). Annotations are in the controller classes; run `php artisan l5-swagger:generate` to regenerate the spec. Paths in annotations use `/api` or `/api/v1` for web compatibility.

# Crévia Cloud Architecture & Deployment Guide

                      ┌────────────────────────────────────────────────────────┐
                      │                   AWS Cloud Infrastructure             │
                      │  ┌─────────────────────────┐  ┌─────────────────────┐  │
                      │  │   CloudFront CDN + S3   │  │   Secrets Manager   │  │
                      │  │  (Pastry Media Assets)  │  │ (Rzp, DB, Auth Keys)│  │
                      │  └───────────┬─────────────┘  └──────────┬──────────┘  │
                      │              │                           │             │
                      │  ┌───────────▼───────────────────────────▼──────────┐  │
                      │  │         Next.js 16 + React 19 Container          │  │
                      │  │       (AWS ECS Fargate / AWS App Runner)         │  │
                      │  │  ┌─────────────────────────────────────────────┐ │  │
                      │  │  │   Zod Form Validation & Typed Server Actions│ │  │
                      │  │  └──────────────────────┬──────────────────────┘ │  │
                      │  └─────────────┬───────────┴───────────┬────────────┘  │
                      │                │                       │               │
                      │  ┌─────────────▼─────────┐   ┌─────────▼────────────┐  │
                      │  │   AWS RDS PostgreSQL  │   │  AWS ElastiCache     │  │
                      │  │  (Orders, Users, Menu)│   │  (Redis Dashboard)   │  │
                      │  └───────────────────────┘   └──────────────────────┘  │
                      └────────────────────────────────────────────────────────┘

---

## 1. Compute Layer: AWS ECS (Fargate) / AWS App Runner
* **Containerization:** Built via multi-stage [`Dockerfile`](../Dockerfile) with Next.js `output: 'standalone'` (~120MB footprint).
* **Scaling:** Auto-scales from 2 to 10 tasks based on CPU/Memory thresholds (target 70% utilization).
* **Health Checks:** Container ping to `/api/health` ensuring zero-downtime rolling deployments.

---

## 2. Relational Database: AWS RDS PostgreSQL (or Aurora Serverless v2)
* **Engine:** PostgreSQL 16
* **Prisma Configuration:** Connects via [`src/lib/prisma.ts`](../src/lib/prisma.ts) using `@prisma/adapter-pg` with pooled connections (`max: 20` per replica).
* **Indexes Configured:**
  * `Order`: Indexed on `[status, deliveryDate]`, `customerPhone`, and `userId`.
  * `User`: Unique index on `phone`.
  * `Product`: Index on `categoryId`.
  * `OrderItem`: Index on `orderId` and `productId`.
* **Automated Snapshots:** 7-day retention with point-in-time recovery (PITR).

---

## 3. In-Memory Cache: AWS ElastiCache for Redis
* **Role:** High-speed cache for read-heavy operations, specifically the Admin Dashboard summary (`admin:dashboard:summary`).
* **Invalidation Strategy:** Explicit invalidation implemented in [`src/lib/redis.ts`](../src/lib/redis.ts) triggered whenever:
  * A new order is placed (`createOrder`).
  * An order status is updated (`updateOrderStatus`).
  * An order is marked as delivered with 4-digit PIN (`markAsDelivered`).
  * An order is cancelled within the 24-hour window (`cancelOrder`).
  * A Razorpay payment is verified (`verifyPayment`).

---

## 4. Media Storage & Global Delivery: Amazon S3 + CloudFront CDN
* **Storage Bucket:** `crevia-pastry-assets-prod` for high-resolution artisanal cake and pastry photos.
* **CDN:** Amazon CloudFront with origin request policies and edge caching for sub-50ms photo loads across India.
* **Remote Image Optimization:** Configured in [`next.config.ts`](../next.config.ts) for responsive WebP/AVIF generation.

---

## 5. Security & Secrets Management: AWS Secrets Manager
Environment secrets injected at container startup:
```bash
DATABASE_URL="postgresql://crevia_admin:<SECRET>@crevia-db.cluster-xxxx.rds.amazonaws.com:5432/crevia?schema=public&sslmode=require"
REDIS_URL="rediss://:<SECRET>@crevia-cache.xxxx.cache.amazonaws.com:6379"
RAZORPAY_KEY_ID="rzp_live_..."
RAZORPAY_KEY_SECRET="..."
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_..."
```

---

## 6. Local & Staging Environments (Docker Compose)
To run the full stack locally with matching production architecture:
```bash
docker compose up -d
```
This provisions:
* **Next.js Web Server** on `http://localhost:3000`
* **PostgreSQL 16** on `localhost:5432`
* **Redis 7** on `localhost:6379`

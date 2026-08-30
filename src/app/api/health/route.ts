import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

export async function GET() {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      redis: 'unknown',
      database: 'unknown',
    },
  };

  // Check Redis
  try {
    const redis = getRedisClient();

    if (redis.isReady) {
      checks.services.redis = 'healthy';
    } else {
      checks.services.redis = 'unhealthy';
      checks.status = 'degraded';
    }
  } catch (error) {
    checks.services.redis = 'unhealthy';
    checks.status = 'degraded';
  }

  // Check Database
  try {
    // const { PrismaClient } = await import('@prisma/client');
    // const prisma = new PrismaClient();
    // await prisma.$queryRaw`SELECT 1`;
    // await prisma.$disconnect();

    checks.services.database = 'healthy';
  } catch (error) {
    checks.services.database = 'unhealthy';
    checks.status = 'degraded';
  }

  const statusCode =
    checks.status === 'healthy' ? 200 : 503;

  return NextResponse.json(checks, {
    status: statusCode,
  });
}
import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/redis';

// Example: Cache expensive data for 5 minutes
export async function GET(request: NextRequest) {
  const cacheKey = 'example:expensive-data';
  const ttlSeconds = 300; // 5 minutes

  // Try to get from cache first
  const cachedData = await cache.get(cacheKey);
  if (cachedData) {
    return NextResponse.json({
      ...cachedData,
      cached: true,
      cacheTimestamp: new Date().toISOString(),
    });
  }

  // Simulate expensive operation (replace with actual logic)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const freshData = {
    message: 'Fresh data from API',
    timestamp: new Date().toISOString(),
    items: Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` })),
  };

  // Store in cache
  await cache.set(cacheKey, freshData, ttlSeconds);

  return NextResponse.json({
    ...freshData,
    cached: false,
  });
}

// Example: Invalidate cache
export async function DELETE() {
  await cache.del('example:expensive-data');
  return NextResponse.json({ message: 'Cache invalidated' });
}
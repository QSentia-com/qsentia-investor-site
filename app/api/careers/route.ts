import { NextResponse } from 'next/server';
import { readBackOfficeStore } from '@/lib/adminBackOffice';

export async function GET() {
  try {
    const store = await readBackOfficeStore();
    const roles = store.careerRoles
      .filter((role) => role.status === 'open')
      .map((role) => ({
        id: role.id,
        title: role.title,
        department: role.department,
        location: role.location,
        notes: role.notes,
        updatedAt: role.updatedAt,
      }));

    return NextResponse.json({ roles }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Error loading careers:', error);
    return NextResponse.json(
      { error: 'Failed to load careers' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

import { NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET() {
  try {
    const configs = await db.apiConfig.findAll()
    return NextResponse.json({ configs })
  } catch (error) {
    console.error('Error fetching API configs:', error)
    return NextResponse.json({ error: 'Failed to fetch API configs' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const config = await db.apiConfig.create({
      name: data.name,
      description: data.description,
      baseUrl: data.baseUrl,
      version: data.version,
      authenticationType: data.authenticationType,
      authUsername: data.authUsername,
      authPassword: data.authPassword,
      authToken: data.authToken,
      authApiKey: data.authApiKey,
      authApiKeyHeader: data.authApiKeyHeader,
      defaultHeaders: data.defaultHeaders,
      timeout: data.timeout,
      retryCount: data.retryCount,
      isActive: data.isActive !== undefined ? data.isActive : true
    })
    
    return NextResponse.json({ config }, { status: 201 })
  } catch (error) {
    console.error('Error creating API config:', error)
    return NextResponse.json({ error: 'Failed to create API config' }, { status: 500 })
  }
}
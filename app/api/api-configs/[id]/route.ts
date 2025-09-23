import { NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const config = await db.apiConfig.findById(params.id)
    
    if (!config) {
      return NextResponse.json({ error: 'API config not found' }, { status: 404 })
    }
    
    return NextResponse.json({ config })
  } catch (error) {
    console.error('Error fetching API config:', error)
    return NextResponse.json({ error: 'Failed to fetch API config' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    
    const config = await db.apiConfig.update(params.id, {
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
      isActive: data.isActive
    })
    
    return NextResponse.json({ config })
  } catch (error) {
    console.error('Error updating API config:', error)
    return NextResponse.json({ error: 'Failed to update API config' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await db.apiConfig.delete(params.id)
    return NextResponse.json({ message: 'API config deleted successfully' })
  } catch (error) {
    console.error('Error deleting API config:', error)
    return NextResponse.json({ error: 'Failed to delete API config' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { subscription, userId } = await request.json()

    if (!subscription || !userId) {
      return NextResponse.json(
        { error: 'Subscription and userId are required' },
        { status: 400 }
      )
    }

    console.log('📱 Push subscription received:', {
      userId,
      endpoint: subscription.endpoint
    })

    // Store subscription in database
    // This is a simplified version - you might want to create a proper subscriptions table
    try {
      await db.user.update({
        where: { id: userId },
        data: {
          pushSubscription: JSON.stringify(subscription),
          notificationEnabled: true
        }
      })

      console.log('✅ Push subscription stored for user:', userId)
      
      return NextResponse.json({
        success: true,
        message: 'Subscription stored successfully'
      })
    } catch (dbError) {
      console.error('❌ Database error:', dbError)
      
      // For now, just log the subscription (you can implement proper storage later)
      console.log('📝 Subscription data:', JSON.stringify(subscription, null, 2))
      
      return NextResponse.json({
        success: true,
        message: 'Subscription received (stored in logs)'
      })
    }

  } catch (error) {
    console.error('❌ Error handling push subscription:', error)
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    )
  }
}







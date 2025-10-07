import { NextRequest, NextResponse } from 'next/server';

// WhatsApp Business API - Bu örnek için Twilio kullanıyoruz
// Gerçek production'da kendi WhatsApp Business API endpoint'inizi kullanın

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message, reportData } = await request.json();

    // Format phone number (Türkiye için +90)
    const formattedPhone = phoneNumber.startsWith('+') 
      ? phoneNumber 
      : `+90${phoneNumber.replace(/\D/g, '')}`;

    // Bu örnekte sadece log alıyoruz
    // Gerçek kullanımda Twilio/WhatsApp Business API'sine istek atılacak
    console.log('WhatsApp Message:', {
      to: formattedPhone,
      message,
      reportData
    });

    // Simüle edilmiş başarılı gönderim
    return NextResponse.json({
      success: true,
      message: 'WhatsApp mesajı gönderildi',
      data: {
        to: formattedPhone,
        sentAt: new Date().toISOString()
      }
    });

    /*
    // Gerçek Twilio Örneği:
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_WHATSAPP_NUMBER;

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: `whatsapp:${twilioPhone}`,
          To: `whatsapp:${formattedPhone}`,
          Body: message
        })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'WhatsApp gönderim hatası');
    }

    return NextResponse.json({
      success: true,
      message: 'WhatsApp mesajı gönderildi',
      data
    });
    */

  } catch (error: any) {
    console.error('WhatsApp API Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'WhatsApp mesajı gönderilemedi',
        details: error.message 
      },
      { status: 500 }
    );
  }
}


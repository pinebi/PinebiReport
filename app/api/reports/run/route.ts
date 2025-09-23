import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== REPORT API CALL START ===')
    console.log('Request received at:', new Date().toISOString())
    
    const requestBody = await request.json()
    console.log('Request body received:', JSON.stringify(requestBody, null, 2))
    
    const { apiUrl, headers, method = 'GET', body } = requestBody
    console.log('Parsed - API URL:', apiUrl)
    console.log('Parsed - Headers:', headers)
    console.log('Parsed - Method:', method)
    console.log('Parsed - Body:', body)

    if (!apiUrl) {
      console.log('ERROR: No API URL provided')
      return NextResponse.json({ error: 'API URL is required' }, { status: 400 })
    }

    // Use the main API URL as target, but add endpoint info to headers
    let targetUrl = apiUrl
    let endpointInfo = ''
    
    // Check for endpoint in different header formats
    if (headers && headers.ENDPOINT) {
      endpointInfo = headers.ENDPOINT
      console.log('Using ENDPOINT from headers:', endpointInfo)
    } else if (headers && headers.url) {
      endpointInfo = headers.url
      console.log('Using url from headers:', endpointInfo)
    }
    
    // Prepare headers for the external API call
    const externalHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Basic UElORUJJOnE4MXltQWJ0eDFqSjhob2M4SVBVNzlMalBlbXVYam9rMk5YWVJUYTUx'
    }
    
    // Add endpoint as header if available
    if (endpointInfo) {
      externalHeaders['ENDPOINT'] = endpointInfo
      console.log('Added ENDPOINT header:', endpointInfo)
    }

    // Make the external API call from the backend with longer timeout
    console.log('Making external API call to:', targetUrl)
    console.log('With headers:', externalHeaders)
    console.log('Request body:', body)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
    
    const response = await fetch(targetUrl, {
      method,
      headers: externalHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    console.log('External API response status:', response.status)

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    // Try to parse JSON response, but handle non-JSON responses
    let data
    const contentType = response.headers.get('content-type')
    const responseText = await response.text()
    
    console.log('Response content-type:', contentType)
    console.log('Response text:', responseText.substring(0, 500)) // First 500 chars
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('JSON parse error:', parseError)
        if (parseError instanceof Error) {
          throw new Error(`Invalid JSON response: ${parseError.message}`)
        } else {
          throw new Error('Invalid JSON response')
        }
      }
    } else {
      // If not JSON, return the text response
      data = { 
        rawResponse: responseText,
        contentType: contentType,
        note: 'Response was not JSON format'
      }
    }

    return NextResponse.json({ 
      success: true, 
      data,
      status: response.status,
      statusText: response.statusText
    })

  } catch (error: any) {
    console.error('Report execution error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    })
    return NextResponse.json({ 
      error: error.message || 'Report execution failed',
      success: false,
      details: error.message
    }, { status: 500 })
  }
}

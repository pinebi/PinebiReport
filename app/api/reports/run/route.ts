import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json()
    const { apiUrl, headers, method = 'GET', body } = requestBody

    if (!apiUrl) {
      return NextResponse.json({ error: 'API URL is required' }, { status: 400 })
    }

    // Use the main API URL as target, but add endpoint info to headers
    let targetUrl = apiUrl
    let endpointInfo = ''
    
    // Check for endpoint in different header formats
    if (headers && headers.ENDPOINT) {
      endpointInfo = headers.ENDPOINT
    } else if (headers && headers.url) {
      endpointInfo = headers.url
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
    }

    // Make the external API call from the backend with longer timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120000) // 120 second timeout (2 minutes)
    
    const response = await fetch(targetUrl, {
      method,
      headers: externalHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    // Try to parse JSON response, but handle non-JSON responses
    let data
    const contentType = response.headers.get('content-type')
    const responseText = await response.text()
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('⚠️ JSON parse error')
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
    console.error('❌ Report API error:', error.message)
    return NextResponse.json({ 
      error: error.message || 'Report execution failed',
      success: false,
      details: error.message
    }, { status: 500 })
  }
}

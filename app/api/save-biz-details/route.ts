import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log('Received business details in API route:', data)
    
    // Save to a temp file in the workspace
    const tempFilePath = path.join(process.cwd(), 'lib', 'temp-biz-details.json')
    let currentData = []
    if (fs.existsSync(tempFilePath)) {
      currentData = JSON.parse(fs.readFileSync(tempFilePath, 'utf8'))
    }
    currentData.push(data)
    fs.writeFileSync(tempFilePath, JSON.stringify(currentData, null, 2))
    
    return NextResponse.json({ success: true, message: 'Saved successfully' })
  } catch (error: any) {
    console.error('Error in save-biz-details API:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

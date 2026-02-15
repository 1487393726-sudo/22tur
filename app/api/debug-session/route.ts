import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getToken } from 'next-auth/jwt'

export async function GET(request: NextRequest) {
  try {
    // 获取 session
    const session = await getServerSession(authOptions)
    
    // 获取 JWT token
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    })
    
    return NextResponse.json({
      session,
      token,
      hasSession: !!session,
      hasToken: !!token,
      tokenRole: token?.role,
      sessionRole: session?.user?.role
    })
  } catch (error) {
    console.error('Debug session error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

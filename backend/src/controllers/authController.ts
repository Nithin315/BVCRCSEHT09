import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { ApiResponse, User } from '@/types'
import { createError, asyncHandler } from '@/middleware/errorHandler'

const prisma = new PrismaClient()

// Generate JWT token
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  })
}

// Generate refresh token
const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  })
}

// Register user
export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw createError('User already exists with this email', 400)
  }

  // Hash password
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12')
  const hashedPassword = await bcrypt.hash(password, saltRounds)

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  })

  // Generate tokens
  const token = generateToken(user.id)
  const refreshToken = generateRefreshToken(user.id)

  // Create default portfolio
  await prisma.portfolio.create({
    data: {
      userId: user.id,
      name: 'My Portfolio',
      isDefault: true
    }
  })

  // Create default watchlist
  await prisma.watchlist.create({
    data: {
      userId: user.id,
      name: 'My Watchlist',
      symbols: [],
      isDefault: true
    }
  })

  // Create user settings
  await prisma.userSettings.create({
    data: {
      userId: user.id,
      theme: 'system',
      notifications: {
        email: true,
        push: true,
        priceAlerts: true,
        newsAlerts: true,
        portfolioUpdates: true
      },
      privacy: {
        profileVisibility: 'PRIVATE',
        portfolioSharing: false,
        dataSharing: false
      },
      trading: {
        defaultOrderType: 'MARKET',
        defaultQuantity: 1,
        confirmOrders: true,
        autoRebalance: false
      }
    }
  })

  const response: ApiResponse<{ user: User; token: string; refreshToken: string }> = {
    success: true,
    data: {
      user,
      token,
      refreshToken
    },
    message: 'User registered successfully'
  }

  res.status(201).json(response)
})

// Login user
export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body

  // Find user
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user || !user.isActive) {
    throw createError('Invalid credentials', 401)
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    throw createError('Invalid credentials', 401)
  }

  // Generate tokens
  const token = generateToken(user.id)
  const refreshToken = generateRefreshToken(user.id)

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user

  const response: ApiResponse<{ user: User; token: string; refreshToken: string }> = {
    success: true,
    data: {
      user: userWithoutPassword,
      token,
      refreshToken
    },
    message: 'Login successful'
  }

  res.json(response)
})

// Logout user
export const logout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // In a real application, you might want to blacklist the token
  // For now, we'll just return a success message
  const response: ApiResponse<null> = {
    success: true,
    data: null,
    message: 'Logout successful'
  }

  res.json(response)
})

// Refresh token
export const refreshToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    throw createError('Refresh token is required', 400)
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user || !user.isActive) {
      throw createError('Invalid refresh token', 401)
    }

    // Generate new tokens
    const newToken = generateToken(user.id)
    const newRefreshToken = generateRefreshToken(user.id)

    const response: ApiResponse<{ user: User; token: string; refreshToken: string }> = {
      success: true,
      data: {
        user,
        token: newToken,
        refreshToken: newRefreshToken
      },
      message: 'Token refreshed successfully'
    }

    res.json(response)
  } catch (error) {
    throw createError('Invalid refresh token', 401)
  }
})

// Forgot password
export const forgotPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    // Don't reveal if email exists or not
    const response: ApiResponse<null> = {
      success: true,
      data: null,
      message: 'If the email exists, a password reset link has been sent'
    }
    return res.json(response)
  }

  // Generate reset token
  const resetToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  )

  // In a real application, you would send an email with the reset link
  // For now, we'll just return the token (in production, don't do this!)
  console.log(`Password reset token for ${email}: ${resetToken}`)

  const response: ApiResponse<{ resetToken: string }> = {
    success: true,
    data: { resetToken },
    message: 'Password reset token generated'
  }

  res.json(response)
})

// Reset password
export const resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { token, password } = req.body

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      throw createError('Invalid reset token', 400)
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12')
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    const response: ApiResponse<null> = {
      success: true,
      data: null,
      message: 'Password reset successfully'
    }

    res.json(response)
  } catch (error) {
    throw createError('Invalid or expired reset token', 400)
  }
})

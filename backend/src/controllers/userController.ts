import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { ApiResponse } from '@/types'
import { asyncHandler } from '@/middleware/errorHandler'

const prisma = new PrismaClient()

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
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

  const response: ApiResponse<any> = {
    success: true,
    data: user,
    message: 'Profile retrieved successfully'
  }

  res.json(response)
})

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name, email } = req.body
  const updateData: any = {}

  if (name) updateData.name = name
  if (email) {
    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: req.user!.id }
      }
    })

    if (existingUser) {
      throw new Error('Email is already taken')
    }
    updateData.email = email
  }

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: updateData,
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

  const response: ApiResponse<any> = {
    success: true,
    data: user,
    message: 'Profile updated successfully'
  }

  res.json(response)
})

export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  // Delete user and all related data (cascade delete)
  await prisma.user.delete({
    where: { id: req.user!.id }
  })

  const response: ApiResponse<null> = {
    success: true,
    data: null,
    message: 'Account deleted successfully'
  }

  res.json(response)
})

export const getUserSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await prisma.userSettings.findUnique({
    where: { userId: req.user!.id }
  })

  const response: ApiResponse<any> = {
    success: true,
    data: settings,
    message: 'Settings retrieved successfully'
  }

  res.json(response)
})

export const updateUserSettings = asyncHandler(async (req: Request, res: Response) => {
  const { theme, notifications, privacy, trading } = req.body

  const settings = await prisma.userSettings.upsert({
    where: { userId: req.user!.id },
    update: {
      theme,
      notifications,
      privacy,
      trading
    },
    create: {
      userId: req.user!.id,
      theme: theme || 'system',
      notifications: notifications || {},
      privacy: privacy || {},
      trading: trading || {}
    }
  })

  const response: ApiResponse<any> = {
    success: true,
    data: settings,
    message: 'Settings updated successfully'
  }

  res.json(response)
})

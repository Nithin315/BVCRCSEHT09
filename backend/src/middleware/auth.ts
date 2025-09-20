import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '@/types'
import { createError } from './errorHandler'

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      throw createError('Access denied. No token provided.', 401)
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    req.user = decoded.user
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw createError('Invalid token.', 401)
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw createError('Token expired.', 401)
    }
    next(error)
  }
}

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw createError('Access denied. User not authenticated.', 401)
    }

    if (!roles.includes(req.user.role || 'user')) {
      throw createError('Access denied. Insufficient permissions.', 403)
    }

    next()
  }
}

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      req.user = decoded.user
    }

    next()
  } catch (error) {
    // For optional auth, we don't throw errors, just continue without user
    next()
  }
}

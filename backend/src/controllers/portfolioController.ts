import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { ApiResponse } from '@/types'
import { asyncHandler } from '@/middleware/errorHandler'

const prisma = new PrismaClient()

export const getPortfolios = asyncHandler(async (req: Request, res: Response) => {
  const portfolios = await prisma.portfolio.findMany({
    where: { userId: req.user!.id },
    include: {
      positions: true,
      _count: {
        select: {
          positions: true,
          transactions: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const response: ApiResponse<any> = {
    success: true,
    data: portfolios,
    message: 'Portfolios retrieved successfully'
  }

  res.json(response)
})

export const getPortfolio = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  const portfolio = await prisma.portfolio.findFirst({
    where: {
      id,
      userId: req.user!.id
    },
    include: {
      positions: true,
      transactions: {
        orderBy: { date: 'desc' },
        take: 10
      }
    }
  })

  if (!portfolio) {
    throw new Error('Portfolio not found')
  }

  const response: ApiResponse<any> = {
    success: true,
    data: portfolio,
    message: 'Portfolio retrieved successfully'
  }

  res.json(response)
})

export const createPortfolio = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body

  const portfolio = await prisma.portfolio.create({
    data: {
      name,
      userId: req.user!.id
    }
  })

  const response: ApiResponse<any> = {
    success: true,
    data: portfolio,
    message: 'Portfolio created successfully'
  }

  res.status(201).json(response)
})

export const updatePortfolio = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { name } = req.body

  const portfolio = await prisma.portfolio.updateMany({
    where: {
      id,
      userId: req.user!.id
    },
    data: { name }
  })

  if (portfolio.count === 0) {
    throw new Error('Portfolio not found')
  }

  const updatedPortfolio = await prisma.portfolio.findUnique({
    where: { id }
  })

  const response: ApiResponse<any> = {
    success: true,
    data: updatedPortfolio,
    message: 'Portfolio updated successfully'
  }

  res.json(response)
})

export const deletePortfolio = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  const portfolio = await prisma.portfolio.deleteMany({
    where: {
      id,
      userId: req.user!.id
    }
  })

  if (portfolio.count === 0) {
    throw new Error('Portfolio not found')
  }

  const response: ApiResponse<null> = {
    success: true,
    data: null,
    message: 'Portfolio deleted successfully'
  }

  res.json(response)
})

export const getPositions = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  const positions = await prisma.position.findMany({
    where: {
      portfolioId: id,
      portfolio: {
        userId: req.user!.id
      }
    },
    orderBy: { marketValue: 'desc' }
  })

  const response: ApiResponse<any> = {
    success: true,
    data: positions,
    message: 'Positions retrieved successfully'
  }

  res.json(response)
})

export const addPosition = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { symbol, shares, averagePrice } = req.body

  // Verify portfolio belongs to user
  const portfolio = await prisma.portfolio.findFirst({
    where: {
      id,
      userId: req.user!.id
    }
  })

  if (!portfolio) {
    throw new Error('Portfolio not found')
  }

  const position = await prisma.position.upsert({
    where: {
      portfolioId_symbol: {
        portfolioId: id,
        symbol
      }
    },
    update: {
      shares: { increment: shares },
      averagePrice: {
        // Recalculate average price
        set: 0 // This would need proper calculation
      }
    },
    create: {
      portfolioId: id,
      symbol,
      shares,
      averagePrice,
      currentPrice: averagePrice, // Would be updated with real-time data
      marketValue: shares * averagePrice,
      costBasis: shares * averagePrice,
      gain: 0,
      gainPercent: 0,
      weight: 0 // Would be calculated based on total portfolio value
    }
  })

  const response: ApiResponse<any> = {
    success: true,
    data: position,
    message: 'Position added successfully'
  }

  res.status(201).json(response)
})

export const updatePosition = asyncHandler(async (req: Request, res: Response) => {
  const { id, symbol } = req.params
  const { shares, averagePrice } = req.body

  const position = await prisma.position.updateMany({
    where: {
      portfolioId: id,
      symbol,
      portfolio: {
        userId: req.user!.id
      }
    },
    data: {
      shares,
      averagePrice
    }
  })

  if (position.count === 0) {
    throw new Error('Position not found')
  }

  const updatedPosition = await prisma.position.findFirst({
    where: {
      portfolioId: id,
      symbol
    }
  })

  const response: ApiResponse<any> = {
    success: true,
    data: updatedPosition,
    message: 'Position updated successfully'
  }

  res.json(response)
})

export const removePosition = asyncHandler(async (req: Request, res: Response) => {
  const { id, symbol } = req.params

  const position = await prisma.position.deleteMany({
    where: {
      portfolioId: id,
      symbol,
      portfolio: {
        userId: req.user!.id
      }
    }
  })

  if (position.count === 0) {
    throw new Error('Position not found')
  }

  const response: ApiResponse<null> = {
    success: true,
    data: null,
    message: 'Position removed successfully'
  }

  res.json(response)
})

export const getTransactions = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { limit = 50, offset = 0 } = req.query

  const transactions = await prisma.transaction.findMany({
    where: {
      portfolioId: id,
      portfolio: {
        userId: req.user!.id
      }
    },
    orderBy: { date: 'desc' },
    take: parseInt(limit as string),
    skip: parseInt(offset as string)
  })

  const response: ApiResponse<any> = {
    success: true,
    data: transactions,
    message: 'Transactions retrieved successfully'
  }

  res.json(response)
})

export const addTransaction = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { symbol, type, shares, price, fees = 0, notes } = req.body

  // Verify portfolio belongs to user
  const portfolio = await prisma.portfolio.findFirst({
    where: {
      id,
      userId: req.user!.id
    }
  })

  if (!portfolio) {
    throw new Error('Portfolio not found')
  }

  const total = shares * price + fees

  const transaction = await prisma.transaction.create({
    data: {
      portfolioId: id,
      userId: req.user!.id,
      symbol,
      type,
      shares,
      price,
      total,
      fees,
      notes
    }
  })

  const response: ApiResponse<any> = {
    success: true,
    data: transaction,
    message: 'Transaction added successfully'
  }

  res.status(201).json(response)
})

import { Request, Response } from 'express'
import { ApiResponse } from '@/types'

export const notFound = (req: Request, res: Response) => {
  const response: ApiResponse<null> = {
    success: false,
    data: null,
    error: `Route ${req.originalUrl} not found`,
    message: 'The requested resource was not found on this server'
  }
  
  res.status(404).json(response)
}

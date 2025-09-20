import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
import yfinance as yf
from pypfopt import EfficientFrontier, risk_models, expected_returns
from pypfopt.discrete_allocation import DiscreteAllocation, get_latest_prices
import logging

logger = logging.getLogger(__name__)

class PortfolioOptimizer:
    """Portfolio optimization using Modern Portfolio Theory"""
    
    def __init__(self):
        self.risk_free_rate = 0.02  # 2% risk-free rate
        
    def optimize_portfolio(
        self,
        current_holdings: List[Dict],
        risk_tolerance: str = 'moderate',
        time_horizon: int = 5,
        target_return: Optional[float] = None
    ) -> Dict:
        """Optimize portfolio using Modern Portfolio Theory"""
        
        try:
            # Get symbols from current holdings
            symbols = [holding.get('symbol') for holding in current_holdings if holding.get('symbol')]
            
            # Add popular stocks for diversification
            additional_symbols = ['SPY', 'QQQ', 'VTI', 'BND', 'GLD', 'VEA', 'VWO']
            all_symbols = list(set(symbols + additional_symbols))
            
            # Fetch historical data
            price_data = self._fetch_price_data(all_symbols, period="2y")
            
            if price_data.empty:
                raise ValueError("Could not fetch sufficient price data")
            
            # Calculate expected returns and risk model
            mu = expected_returns.mean_historical_return(price_data)
            S = risk_models.sample_cov(price_data)
            
            # Create efficient frontier
            ef = EfficientFrontier(mu, S)
            
            # Optimize based on risk tolerance
            if risk_tolerance == 'conservative':
                # Maximize Sharpe ratio with lower risk
                weights = ef.max_sharpe(risk_free_rate=self.risk_free_rate)
                ef.portfolio_performance(verbose=True)
            elif risk_tolerance == 'aggressive':
                # Target higher return
                if target_return is None:
                    target_return = mu.mean() * 1.2  # 20% above average
                try:
                    weights = ef.efficient_return(target_return=target_return)
                except:
                    # Fallback to max Sharpe if target return not achievable
                    weights = ef.max_sharpe(risk_free_rate=self.risk_free_rate)
            else:  # moderate
                # Balance between risk and return
                weights = ef.max_sharpe(risk_free_rate=self.risk_free_rate)
            
            # Clean weights (remove near-zero weights)
            cleaned_weights = ef.clean_weights(cutoff=0.01)
            
            # Calculate portfolio metrics
            expected_return, volatility, sharpe_ratio = ef.portfolio_performance(risk_free_rate=self.risk_free_rate)
            
            # Generate recommendations
            recommendations = self._generate_optimization_recommendations(
                current_holdings, cleaned_weights, price_data
            )
            
            # Calculate rebalancing needs
            rebalancing = self._calculate_rebalancing(current_holdings, cleaned_weights)
            
            return {
                'optimized_weights': cleaned_weights,
                'expected_return': expected_return,
                'expected_volatility': volatility,
                'sharpe_ratio': sharpe_ratio,
                'recommendations': recommendations,
                'rebalancing': rebalancing,
                'risk_tolerance': risk_tolerance,
                'time_horizon': time_horizon,
                'optimization_method': 'Modern Portfolio Theory'
            }
            
        except Exception as e:
            logger.error(f"Error optimizing portfolio: {str(e)}")
            raise
    
    def _fetch_price_data(self, symbols: List[str], period: str = "2y") -> pd.DataFrame:
        """Fetch historical price data for symbols"""
        try:
            # Download data
            data = yf.download(symbols, period=period, progress=False)
            
            # Handle single symbol case
            if len(symbols) == 1:
                data = pd.DataFrame({symbols[0]: data['Close']})
            else:
                # Extract closing prices
                data = data['Close']
            
            # Remove symbols with insufficient data
            data = data.dropna(thresh=len(data) * 0.8, axis=1)
            
            return data
            
        except Exception as e:
            logger.error(f"Error fetching price data: {str(e)}")
            return pd.DataFrame()
    
    def _generate_optimization_recommendations(
        self,
        current_holdings: List[Dict],
        optimized_weights: Dict,
        price_data: pd.DataFrame
    ) -> List[Dict]:
        """Generate specific recommendations based on optimization"""
        recommendations = []
        
        # Calculate current portfolio value
        total_value = sum(holding.get('market_value', 0) for holding in current_holdings)
        
        if total_value == 0:
            return recommendations
        
        # Analyze each optimized position
        for symbol, target_weight in optimized_weights.items():
            if target_weight < 0.01:  # Skip very small weights
                continue
            
            # Find current holding
            current_holding = next(
                (h for h in current_holdings if h.get('symbol') == symbol), 
                None
            )
            
            current_weight = 0
            current_value = 0
            if current_holding:
                current_value = current_holding.get('market_value', 0)
                current_weight = current_value / total_value
            
            # Calculate target value
            target_value = total_value * target_weight
            
            # Determine action
            weight_diff = target_weight - current_weight
            value_diff = target_value - current_value
            
            if abs(weight_diff) > 0.05:  # 5% threshold
                if weight_diff > 0:
                    action = 'INCREASE'
                    confidence = min(90, abs(weight_diff) * 1000)
                else:
                    action = 'DECREASE'
                    confidence = min(90, abs(weight_diff) * 1000)
                
                recommendation = {
                    'symbol': symbol,
                    'action': action,
                    'current_weight': round(current_weight * 100, 2),
                    'target_weight': round(target_weight * 100, 2),
                    'weight_change': round(weight_diff * 100, 2),
                    'value_change': round(value_diff, 2),
                    'confidence': confidence,
                    'reasoning': self._generate_weight_reasoning(symbol, weight_diff, target_weight)
                }
                
                recommendations.append(recommendation)
        
        # Sort by confidence
        recommendations.sort(key=lambda x: x['confidence'], reverse=True)
        return recommendations
    
    def _generate_weight_reasoning(self, symbol: str, weight_diff: float, target_weight: float) -> str:
        """Generate reasoning for weight adjustment"""
        if weight_diff > 0:
            if target_weight > 0.1:
                return f"Increase allocation to {symbol} for better diversification and risk-adjusted returns"
            else:
                return f"Add small position in {symbol} to improve portfolio diversification"
        else:
            if target_weight < 0.05:
                return f"Reduce or eliminate {symbol} position to optimize risk-return profile"
            else:
                return f"Reduce {symbol} allocation to achieve optimal portfolio balance"
    
    def _calculate_rebalancing(self, current_holdings: List[Dict], optimized_weights: Dict) -> Dict:
        """Calculate rebalancing requirements"""
        total_value = sum(holding.get('market_value', 0) for holding in current_holdings)
        
        if total_value == 0:
            return {'needed': False, 'transactions': []}
        
        transactions = []
        total_rebalancing_cost = 0
        
        for symbol, target_weight in optimized_weights.items():
            if target_weight < 0.01:
                continue
            
            current_holding = next(
                (h for h in current_holdings if h.get('symbol') == symbol), 
                None
            )
            
            current_value = current_holding.get('market_value', 0) if current_holding else 0
            target_value = total_value * target_weight
            value_diff = target_value - current_value
            
            if abs(value_diff) > total_value * 0.01:  # 1% threshold
                transaction = {
                    'symbol': symbol,
                    'action': 'BUY' if value_diff > 0 else 'SELL',
                    'amount': abs(value_diff),
                    'shares': 0,  # Would need current price to calculate
                    'priority': 'HIGH' if abs(value_diff) > total_value * 0.05 else 'MEDIUM'
                }
                transactions.append(transaction)
                total_rebalancing_cost += abs(value_diff) * 0.001  # 0.1% transaction cost
        
        return {
            'needed': len(transactions) > 0,
            'transactions': transactions,
            'estimated_cost': total_rebalancing_cost,
            'rebalancing_threshold': 0.05  # 5% deviation triggers rebalancing
        }
    
    def calculate_efficient_frontier(
        self,
        symbols: List[str],
        num_portfolios: int = 100
    ) -> Dict:
        """Calculate efficient frontier for given symbols"""
        try:
            # Fetch price data
            price_data = self._fetch_price_data(symbols)
            
            if price_data.empty:
                raise ValueError("Could not fetch sufficient price data")
            
            # Calculate expected returns and risk model
            mu = expected_returns.mean_historical_return(price_data)
            S = risk_models.sample_cov(price_data)
            
            # Create efficient frontier
            ef = EfficientFrontier(mu, S)
            
            # Generate random portfolios
            n_portfolios = num_portfolios
            results = np.zeros((3, n_portfolios))
            weights_record = []
            
            for i in range(n_portfolios):
                # Generate random weights
                weights = np.random.random(len(symbols))
                weights /= np.sum(weights)
                weights_record.append(weights)
                
                # Calculate portfolio metrics
                portfolio_return = np.sum(weights * mu)
                portfolio_std = np.sqrt(np.dot(weights.T, np.dot(S, weights)))
                sharpe = (portfolio_return - self.risk_free_rate) / portfolio_std
                
                results[0, i] = portfolio_return
                results[1, i] = portfolio_std
                results[2, i] = sharpe
            
            # Find optimal portfolios
            max_sharpe_idx = np.argmax(results[2])
            min_vol_idx = np.argmin(results[1])
            
            return {
                'returns': results[0].tolist(),
                'volatilities': results[1].tolist(),
                'sharpe_ratios': results[2].tolist(),
                'max_sharpe': {
                    'return': results[0, max_sharpe_idx],
                    'volatility': results[1, max_sharpe_idx],
                    'sharpe': results[2, max_sharpe_idx],
                    'weights': dict(zip(symbols, weights_record[max_sharpe_idx]))
                },
                'min_volatility': {
                    'return': results[0, min_vol_idx],
                    'volatility': results[1, min_vol_idx],
                    'sharpe': results[2, min_vol_idx],
                    'weights': dict(zip(symbols, weights_record[min_vol_idx]))
                }
            }
            
        except Exception as e:
            logger.error(f"Error calculating efficient frontier: {str(e)}")
            raise
    
    def monte_carlo_simulation(
        self,
        symbols: List[str],
        initial_value: float = 100000,
        num_simulations: int = 1000,
        time_horizon: int = 252  # 1 year in trading days
    ) -> Dict:
        """Run Monte Carlo simulation for portfolio"""
        try:
            # Fetch price data
            price_data = self._fetch_price_data(symbols)
            
            if price_data.empty:
                raise ValueError("Could not fetch sufficient price data")
            
            # Calculate expected returns and covariance
            mu = expected_returns.mean_historical_return(price_data)
            S = risk_models.sample_cov(price_data)
            
            # Generate random returns
            np.random.seed(42)  # For reproducibility
            returns = np.random.multivariate_normal(mu, S, (num_simulations, time_horizon))
            
            # Calculate portfolio values over time
            portfolio_values = np.zeros((num_simulations, time_horizon + 1))
            portfolio_values[:, 0] = initial_value
            
            for t in range(time_horizon):
                portfolio_values[:, t + 1] = portfolio_values[:, t] * (1 + returns[:, t].mean())
            
            # Calculate statistics
            final_values = portfolio_values[:, -1]
            
            return {
                'simulation_results': {
                    'mean_final_value': np.mean(final_values),
                    'median_final_value': np.median(final_values),
                    'std_final_value': np.std(final_values),
                    'min_final_value': np.min(final_values),
                    'max_final_value': np.max(final_values),
                    'percentile_5': np.percentile(final_values, 5),
                    'percentile_25': np.percentile(final_values, 25),
                    'percentile_75': np.percentile(final_values, 75),
                    'percentile_95': np.percentile(final_values, 95)
                },
                'portfolio_paths': portfolio_values.tolist(),
                'parameters': {
                    'initial_value': initial_value,
                    'num_simulations': num_simulations,
                    'time_horizon': time_horizon,
                    'symbols': symbols
                }
            }
            
        except Exception as e:
            logger.error(f"Error running Monte Carlo simulation: {str(e)}")
            raise

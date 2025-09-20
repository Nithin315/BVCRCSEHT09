import numpy as np
import pandas as pd
from typing import Dict, List, Optional
import yfinance as yf
from scipy import stats
import logging

logger = logging.getLogger(__name__)

class RiskAssessor:
    """Risk assessment and calculation engine"""
    
    def __init__(self):
        self.confidence_levels = [0.95, 0.99]  # 95% and 99% VaR
        
    def calculate_risk_metrics(
        self,
        portfolio_data: Dict,
        market_data: Dict
    ) -> Dict:
        """Calculate comprehensive risk metrics for portfolio"""
        
        try:
            holdings = portfolio_data.get('holdings', [])
            if not holdings:
                return self._empty_risk_metrics()
            
            # Get historical data for all holdings
            symbols = [holding.get('symbol') for holding in holdings]
            price_data = self._fetch_price_data(symbols)
            
            if price_data.empty:
                return self._empty_risk_metrics()
            
            # Calculate portfolio weights
            total_value = sum(holding.get('market_value', 0) for holding in holdings)
            weights = {}
            for holding in holdings:
                symbol = holding.get('symbol')
                value = holding.get('market_value', 0)
                if symbol and total_value > 0:
                    weights[symbol] = value / total_value
            
            # Calculate returns
            returns = price_data.pct_change().dropna()
            
            # Calculate individual risk metrics
            individual_metrics = self._calculate_individual_risk_metrics(returns, weights)
            
            # Calculate portfolio-level metrics
            portfolio_metrics = self._calculate_portfolio_risk_metrics(returns, weights)
            
            # Calculate correlation analysis
            correlation_analysis = self._analyze_correlations(returns)
            
            # Calculate stress test scenarios
            stress_tests = self._run_stress_tests(returns, weights, total_value)
            
            return {
                'individual_metrics': individual_metrics,
                'portfolio_metrics': portfolio_metrics,
                'correlation_analysis': correlation_analysis,
                'stress_tests': stress_tests,
                'risk_summary': self._generate_risk_summary(portfolio_metrics),
                'recommendations': self._generate_risk_recommendations(portfolio_metrics, individual_metrics)
            }
            
        except Exception as e:
            logger.error(f"Error calculating risk metrics: {str(e)}")
            raise
    
    def _fetch_price_data(self, symbols: List[str], period: str = "2y") -> pd.DataFrame:
        """Fetch historical price data"""
        try:
            data = yf.download(symbols, period=period, progress=False)
            
            if len(symbols) == 1:
                data = pd.DataFrame({symbols[0]: data['Close']})
            else:
                data = data['Close']
            
            return data.dropna()
            
        except Exception as e:
            logger.error(f"Error fetching price data: {str(e)}")
            return pd.DataFrame()
    
    def _calculate_individual_risk_metrics(self, returns: pd.DataFrame, weights: Dict) -> Dict:
        """Calculate risk metrics for individual holdings"""
        metrics = {}
        
        for symbol in returns.columns:
            if symbol in weights:
                symbol_returns = returns[symbol].dropna()
                
                # Basic risk metrics
                volatility = symbol_returns.std() * np.sqrt(252)  # Annualized
                sharpe_ratio = (symbol_returns.mean() * 252) / (volatility) if volatility > 0 else 0
                
                # Value at Risk (VaR)
                var_95 = np.percentile(symbol_returns, 5) * 100
                var_99 = np.percentile(symbol_returns, 1) * 100
                
                # Expected Shortfall (Conditional VaR)
                es_95 = symbol_returns[symbol_returns <= np.percentile(symbol_returns, 5)].mean() * 100
                es_99 = symbol_returns[symbol_returns <= np.percentile(symbol_returns, 1)].mean() * 100
                
                # Maximum Drawdown
                cumulative_returns = (1 + symbol_returns).cumprod()
                running_max = cumulative_returns.expanding().max()
                drawdown = (cumulative_returns - running_max) / running_max
                max_drawdown = drawdown.min() * 100
                
                # Beta (if we have market data)
                beta = self._calculate_beta(symbol_returns)
                
                metrics[symbol] = {
                    'volatility': round(volatility * 100, 2),
                    'sharpe_ratio': round(sharpe_ratio, 3),
                    'var_95': round(var_95, 2),
                    'var_99': round(var_99, 2),
                    'expected_shortfall_95': round(es_95, 2),
                    'expected_shortfall_99': round(es_99, 2),
                    'max_drawdown': round(max_drawdown, 2),
                    'beta': round(beta, 3),
                    'weight': round(weights[symbol] * 100, 2)
                }
        
        return metrics
    
    def _calculate_portfolio_risk_metrics(self, returns: pd.DataFrame, weights: Dict) -> Dict:
        """Calculate portfolio-level risk metrics"""
        # Calculate portfolio returns
        portfolio_returns = pd.Series(index=returns.index, dtype=float)
        
        for date in returns.index:
            portfolio_return = 0
            for symbol, weight in weights.items():
                if symbol in returns.columns:
                    portfolio_return += weight * returns.loc[date, symbol]
            portfolio_returns.loc[date] = portfolio_return
        
        portfolio_returns = portfolio_returns.dropna()
        
        # Portfolio volatility
        portfolio_volatility = portfolio_returns.std() * np.sqrt(252)
        
        # Portfolio Sharpe ratio
        risk_free_rate = 0.02  # 2%
        portfolio_sharpe = (portfolio_returns.mean() * 252 - risk_free_rate) / portfolio_volatility
        
        # Portfolio VaR
        var_95 = np.percentile(portfolio_returns, 5) * 100
        var_99 = np.percentile(portfolio_returns, 1) * 100
        
        # Portfolio Expected Shortfall
        es_95 = portfolio_returns[portfolio_returns <= np.percentile(portfolio_returns, 5)].mean() * 100
        es_99 = portfolio_returns[portfolio_returns <= np.percentile(portfolio_returns, 1)].mean() * 100
        
        # Portfolio Maximum Drawdown
        cumulative_returns = (1 + portfolio_returns).cumprod()
        running_max = cumulative_returns.expanding().max()
        drawdown = (cumulative_returns - running_max) / running_max
        max_drawdown = drawdown.min() * 100
        
        # Portfolio Beta
        portfolio_beta = self._calculate_beta(portfolio_returns)
        
        # Concentration risk
        concentration_risk = self._calculate_concentration_risk(weights)
        
        return {
            'portfolio_volatility': round(portfolio_volatility * 100, 2),
            'portfolio_sharpe_ratio': round(portfolio_sharpe, 3),
            'portfolio_var_95': round(var_95, 2),
            'portfolio_var_99': round(var_99, 2),
            'portfolio_expected_shortfall_95': round(es_95, 2),
            'portfolio_expected_shortfall_99': round(es_99, 2),
            'portfolio_max_drawdown': round(max_drawdown, 2),
            'portfolio_beta': round(portfolio_beta, 3),
            'concentration_risk': concentration_risk
        }
    
    def _calculate_beta(self, returns: pd.Series) -> float:
        """Calculate beta relative to market (SPY)"""
        try:
            # Get market data (SPY)
            market_data = yf.download('SPY', period='2y', progress=False)
            market_returns = market_data['Close'].pct_change().dropna()
            
            # Align dates
            common_dates = returns.index.intersection(market_returns.index)
            if len(common_dates) < 30:  # Need sufficient data
                return 1.0
            
            aligned_returns = returns.loc[common_dates]
            aligned_market = market_returns.loc[common_dates]
            
            # Calculate beta
            covariance = np.cov(aligned_returns, aligned_market)[0, 1]
            market_variance = np.var(aligned_market)
            
            beta = covariance / market_variance if market_variance > 0 else 1.0
            return beta
            
        except Exception as e:
            logger.warning(f"Could not calculate beta: {str(e)}")
            return 1.0
    
    def _calculate_concentration_risk(self, weights: Dict) -> Dict:
        """Calculate concentration risk metrics"""
        weight_values = list(weights.values())
        
        # Herfindahl-Hirschman Index (HHI)
        hhi = sum(w**2 for w in weight_values)
        
        # Largest position weight
        max_weight = max(weight_values) if weight_values else 0
        
        # Number of positions
        num_positions = len(weights)
        
        # Effective number of positions
        effective_positions = 1 / hhi if hhi > 0 else 0
        
        return {
            'hhi': round(hhi, 4),
            'max_position_weight': round(max_weight * 100, 2),
            'num_positions': num_positions,
            'effective_positions': round(effective_positions, 2),
            'concentration_level': self._assess_concentration_level(hhi, max_weight)
        }
    
    def _assess_concentration_level(self, hhi: float, max_weight: float) -> str:
        """Assess concentration level"""
        if hhi > 0.25 or max_weight > 0.4:
            return 'HIGH'
        elif hhi > 0.15 or max_weight > 0.25:
            return 'MEDIUM'
        else:
            return 'LOW'
    
    def _analyze_correlations(self, returns: pd.DataFrame) -> Dict:
        """Analyze correlations between holdings"""
        correlation_matrix = returns.corr()
        
        # Find high correlations
        high_correlations = []
        for i in range(len(correlation_matrix.columns)):
            for j in range(i+1, len(correlation_matrix.columns)):
                corr = correlation_matrix.iloc[i, j]
                if abs(corr) > 0.7:  # High correlation threshold
                    high_correlations.append({
                        'symbol1': correlation_matrix.columns[i],
                        'symbol2': correlation_matrix.columns[j],
                        'correlation': round(corr, 3)
                    })
        
        # Average correlation
        upper_triangle = correlation_matrix.where(
            np.triu(np.ones(correlation_matrix.shape), k=1).astype(bool)
        )
        avg_correlation = upper_triangle.stack().mean()
        
        return {
            'correlation_matrix': correlation_matrix.round(3).to_dict(),
            'high_correlations': high_correlations,
            'average_correlation': round(avg_correlation, 3),
            'diversification_score': round(1 - abs(avg_correlation), 3)
        }
    
    def _run_stress_tests(self, returns: pd.DataFrame, weights: Dict, total_value: float) -> Dict:
        """Run stress test scenarios"""
        scenarios = {}
        
        # Market crash scenario (-20% market return)
        market_crash_return = -0.20
        crash_impact = self._calculate_scenario_impact(returns, weights, market_crash_return)
        scenarios['market_crash'] = {
            'description': '20% market decline',
            'portfolio_impact': round(crash_impact * 100, 2),
            'dollar_impact': round(crash_impact * total_value, 2)
        }
        
        # Interest rate shock scenario
        rate_shock_return = -0.10
        rate_impact = self._calculate_scenario_impact(returns, weights, rate_shock_return)
        scenarios['interest_rate_shock'] = {
            'description': '10% interest rate shock',
            'portfolio_impact': round(rate_impact * 100, 2),
            'dollar_impact': round(rate_impact * total_value, 2)
        }
        
        # Volatility spike scenario
        vol_spike_return = -0.15
        vol_impact = self._calculate_scenario_impact(returns, weights, vol_spike_return)
        scenarios['volatility_spike'] = {
            'description': '15% volatility spike',
            'portfolio_impact': round(vol_impact * 100, 2),
            'dollar_impact': round(vol_impact * total_value, 2)
        }
        
        return scenarios
    
    def _calculate_scenario_impact(self, returns: pd.DataFrame, weights: Dict, scenario_return: float) -> float:
        """Calculate portfolio impact for a given scenario"""
        # Simple scenario impact calculation
        # In practice, this would be more sophisticated
        portfolio_impact = 0
        
        for symbol, weight in weights.items():
            if symbol in returns.columns:
                # Assume correlation with market scenario
                symbol_impact = scenario_return * weight * 0.8  # 80% correlation assumption
                portfolio_impact += symbol_impact
        
        return portfolio_impact
    
    def _generate_risk_summary(self, portfolio_metrics: Dict) -> Dict:
        """Generate risk summary and rating"""
        volatility = portfolio_metrics.get('portfolio_volatility', 0)
        max_drawdown = abs(portfolio_metrics.get('portfolio_max_drawdown', 0))
        var_95 = abs(portfolio_metrics.get('portfolio_var_95', 0))
        
        # Risk rating
        if volatility < 15 and max_drawdown < 10:
            risk_rating = 'LOW'
        elif volatility < 25 and max_drawdown < 20:
            risk_rating = 'MEDIUM'
        else:
            risk_rating = 'HIGH'
        
        return {
            'overall_risk_rating': risk_rating,
            'primary_risks': self._identify_primary_risks(portfolio_metrics),
            'risk_score': self._calculate_risk_score(portfolio_metrics)
        }
    
    def _identify_primary_risks(self, portfolio_metrics: Dict) -> List[str]:
        """Identify primary risk factors"""
        risks = []
        
        if portfolio_metrics.get('portfolio_volatility', 0) > 20:
            risks.append('High volatility')
        
        if abs(portfolio_metrics.get('portfolio_max_drawdown', 0)) > 15:
            risks.append('Large potential losses')
        
        if portfolio_metrics.get('concentration_risk', {}).get('concentration_level') == 'HIGH':
            risks.append('High concentration risk')
        
        if portfolio_metrics.get('portfolio_beta', 1) > 1.2:
            risks.append('High market sensitivity')
        
        return risks if risks else ['Well-diversified portfolio']
    
    def _calculate_risk_score(self, portfolio_metrics: Dict) -> int:
        """Calculate overall risk score (0-100)"""
        score = 50  # Base score
        
        # Adjust based on volatility
        volatility = portfolio_metrics.get('portfolio_volatility', 0)
        if volatility > 30:
            score += 20
        elif volatility > 20:
            score += 10
        elif volatility < 10:
            score -= 10
        
        # Adjust based on max drawdown
        max_drawdown = abs(portfolio_metrics.get('portfolio_max_drawdown', 0))
        if max_drawdown > 20:
            score += 15
        elif max_drawdown > 10:
            score += 5
        elif max_drawdown < 5:
            score -= 5
        
        return max(0, min(100, score))
    
    def _generate_risk_recommendations(self, portfolio_metrics: Dict, individual_metrics: Dict) -> List[str]:
        """Generate risk management recommendations"""
        recommendations = []
        
        # Volatility recommendations
        volatility = portfolio_metrics.get('portfolio_volatility', 0)
        if volatility > 25:
            recommendations.append("Consider reducing portfolio volatility through diversification or defensive assets")
        elif volatility < 10:
            recommendations.append("Portfolio may be too conservative; consider adding growth assets")
        
        # Concentration recommendations
        concentration = portfolio_metrics.get('concentration_risk', {})
        if concentration.get('concentration_level') == 'HIGH':
            recommendations.append("Reduce concentration risk by diversifying across more positions")
        
        # Individual position recommendations
        for symbol, metrics in individual_metrics.items():
            if metrics.get('volatility', 0) > 40:
                recommendations.append(f"Consider reducing position in {symbol} due to high volatility")
            if metrics.get('weight', 0) > 20:
                recommendations.append(f"Reduce overweight position in {symbol}")
        
        return recommendations if recommendations else ["Portfolio risk profile appears well-balanced"]
    
    def _empty_risk_metrics(self) -> Dict:
        """Return empty risk metrics structure"""
        return {
            'individual_metrics': {},
            'portfolio_metrics': {},
            'correlation_analysis': {},
            'stress_tests': {},
            'risk_summary': {
                'overall_risk_rating': 'UNKNOWN',
                'primary_risks': ['No portfolio data available'],
                'risk_score': 0
            },
            'recommendations': ['Please add holdings to calculate risk metrics']
        }

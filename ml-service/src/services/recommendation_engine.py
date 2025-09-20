import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional
import yfinance as yf
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import logging

logger = logging.getLogger(__name__)

class RecommendationEngine:
    """AI-powered investment recommendation engine"""
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.feature_columns = [
            'pe_ratio', 'pb_ratio', 'debt_to_equity', 'current_ratio',
            'return_on_equity', 'revenue_growth', 'earnings_growth',
            'price_momentum', 'volume_trend', 'volatility'
        ]
        
    def generate_recommendations(
        self, 
        user_id: str, 
        risk_profile: str = 'moderate',
        portfolio_data: Dict = None
    ) -> List[Dict]:
        """Generate personalized investment recommendations"""
        
        try:
            # Get user's current portfolio
            current_holdings = portfolio_data.get('holdings', []) if portfolio_data else []
            
            # Get market data for analysis
            market_data = self._get_market_data()
            
            # Analyze current portfolio
            portfolio_analysis = self._analyze_portfolio(current_holdings, market_data)
            
            # Generate stock recommendations
            stock_recommendations = self._generate_stock_recommendations(
                risk_profile, portfolio_analysis, market_data
            )
            
            # Generate portfolio-level recommendations
            portfolio_recommendations = self._generate_portfolio_recommendations(
                current_holdings, risk_profile, market_data
            )
            
            return {
                'stock_recommendations': stock_recommendations,
                'portfolio_recommendations': portfolio_recommendations,
                'risk_analysis': portfolio_analysis.get('risk_metrics', {}),
                'generated_at': pd.Timestamp.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {str(e)}")
            raise
    
    def _get_market_data(self) -> Dict:
        """Fetch current market data"""
        # Popular stocks for analysis
        symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX']
        
        market_data = {}
        for symbol in symbols:
            try:
                ticker = yf.Ticker(symbol)
                info = ticker.info
                hist = ticker.history(period="1y")
                
                if not hist.empty:
                    market_data[symbol] = {
                        'current_price': hist['Close'].iloc[-1],
                        'price_change': hist['Close'].pct_change().iloc[-1] * 100,
                        'volume': hist['Volume'].iloc[-1],
                        'volatility': hist['Close'].pct_change().std() * np.sqrt(252) * 100,
                        'pe_ratio': info.get('trailingPE', 0),
                        'pb_ratio': info.get('priceToBook', 0),
                        'debt_to_equity': info.get('debtToEquity', 0),
                        'current_ratio': info.get('currentRatio', 0),
                        'return_on_equity': info.get('returnOnEquity', 0),
                        'revenue_growth': info.get('revenueGrowth', 0),
                        'earnings_growth': info.get('earningsGrowth', 0),
                        'sector': info.get('sector', 'Unknown'),
                        'market_cap': info.get('marketCap', 0)
                    }
            except Exception as e:
                logger.warning(f"Could not fetch data for {symbol}: {str(e)}")
                continue
        
        return market_data
    
    def _analyze_portfolio(self, holdings: List[Dict], market_data: Dict) -> Dict:
        """Analyze current portfolio composition and risk"""
        if not holdings:
            return {'risk_metrics': {}, 'sector_allocation': {}, 'total_value': 0}
        
        total_value = sum(holding.get('market_value', 0) for holding in holdings)
        sector_allocation = {}
        risk_metrics = {}
        
        for holding in holdings:
            symbol = holding.get('symbol')
            weight = holding.get('market_value', 0) / total_value if total_value > 0 else 0
            
            if symbol in market_data:
                sector = market_data[symbol].get('sector', 'Unknown')
                sector_allocation[sector] = sector_allocation.get(sector, 0) + weight
        
        # Calculate portfolio risk metrics
        if market_data:
            portfolio_volatility = self._calculate_portfolio_volatility(holdings, market_data)
            risk_metrics = {
                'portfolio_volatility': portfolio_volatility,
                'sector_concentration': max(sector_allocation.values()) if sector_allocation else 0,
                'number_of_holdings': len(holdings)
            }
        
        return {
            'risk_metrics': risk_metrics,
            'sector_allocation': sector_allocation,
            'total_value': total_value
        }
    
    def _generate_stock_recommendations(
        self, 
        risk_profile: str, 
        portfolio_analysis: Dict, 
        market_data: Dict
    ) -> List[Dict]:
        """Generate individual stock recommendations"""
        recommendations = []
        
        for symbol, data in market_data.items():
            try:
                # Calculate recommendation score
                score = self._calculate_recommendation_score(symbol, data, risk_profile, portfolio_analysis)
                
                # Determine action based on score
                if score > 0.7:
                    action = 'BUY'
                    confidence = min(score * 100, 95)
                elif score < 0.3:
                    action = 'SELL'
                    confidence = min((1 - score) * 100, 95)
                else:
                    action = 'HOLD'
                    confidence = 50
                
                # Generate reasoning
                reasoning = self._generate_reasoning(symbol, data, action, score)
                
                recommendation = {
                    'symbol': symbol,
                    'action': action,
                    'confidence': round(confidence, 1),
                    'reasoning': reasoning,
                    'current_price': data['current_price'],
                    'target_price': self._calculate_target_price(data['current_price'], score),
                    'risk_level': self._determine_risk_level(data),
                    'time_horizon': self._determine_time_horizon(risk_profile),
                    'sector': data.get('sector', 'Unknown')
                }
                
                recommendations.append(recommendation)
                
            except Exception as e:
                logger.warning(f"Error generating recommendation for {symbol}: {str(e)}")
                continue
        
        # Sort by confidence and return top recommendations
        recommendations.sort(key=lambda x: x['confidence'], reverse=True)
        return recommendations[:10]  # Return top 10 recommendations
    
    def _calculate_recommendation_score(
        self, 
        symbol: str, 
        data: Dict, 
        risk_profile: str, 
        portfolio_analysis: Dict
    ) -> float:
        """Calculate recommendation score (0-1)"""
        score = 0.5  # Base score
        
        # Fundamental analysis
        pe_ratio = data.get('pe_ratio', 0)
        if 10 <= pe_ratio <= 25:  # Reasonable PE range
            score += 0.1
        elif pe_ratio > 30:  # Overvalued
            score -= 0.1
        
        # Growth metrics
        revenue_growth = data.get('revenue_growth', 0)
        if revenue_growth > 0.1:  # 10%+ revenue growth
            score += 0.15
        elif revenue_growth < -0.05:  # Declining revenue
            score -= 0.15
        
        # Volatility adjustment based on risk profile
        volatility = data.get('volatility', 0)
        if risk_profile == 'conservative' and volatility > 30:
            score -= 0.2
        elif risk_profile == 'aggressive' and volatility < 15:
            score -= 0.1
        
        # Price momentum
        price_change = data.get('price_change', 0)
        if price_change > 5:  # Strong positive momentum
            score += 0.1
        elif price_change < -10:  # Strong negative momentum
            score -= 0.1
        
        # Portfolio diversification
        sector_allocation = portfolio_analysis.get('sector_allocation', {})
        sector = data.get('sector', 'Unknown')
        current_sector_weight = sector_allocation.get(sector, 0)
        
        if current_sector_weight > 0.3:  # Over-concentrated in sector
            score -= 0.1
        elif current_sector_weight < 0.1:  # Under-represented sector
            score += 0.05
        
        return max(0, min(1, score))  # Clamp between 0 and 1
    
    def _generate_reasoning(self, symbol: str, data: Dict, action: str, score: float) -> str:
        """Generate human-readable reasoning for recommendation"""
        reasons = []
        
        pe_ratio = data.get('pe_ratio', 0)
        if pe_ratio > 0:
            if pe_ratio < 15:
                reasons.append("attractive valuation with low P/E ratio")
            elif pe_ratio > 30:
                reasons.append("high valuation concerns with elevated P/E ratio")
        
        revenue_growth = data.get('revenue_growth', 0)
        if revenue_growth > 0.1:
            reasons.append("strong revenue growth trajectory")
        elif revenue_growth < -0.05:
            reasons.append("declining revenue performance")
        
        volatility = data.get('volatility', 0)
        if volatility > 30:
            reasons.append("high volatility may not suit conservative investors")
        elif volatility < 15:
            reasons.append("low volatility provides stability")
        
        price_change = data.get('price_change', 0)
        if price_change > 5:
            reasons.append("positive price momentum")
        elif price_change < -10:
            reasons.append("negative price momentum")
        
        if not reasons:
            reasons.append("mixed signals require careful monitoring")
        
        return f"Based on analysis: {', '.join(reasons)}."
    
    def _calculate_target_price(self, current_price: float, score: float) -> Optional[float]:
        """Calculate target price based on recommendation score"""
        if score > 0.6:  # Buy recommendation
            return round(current_price * (1 + (score - 0.5) * 0.2), 2)
        elif score < 0.4:  # Sell recommendation
            return round(current_price * (1 - (0.5 - score) * 0.2), 2)
        return None
    
    def _determine_risk_level(self, data: Dict) -> str:
        """Determine risk level based on stock characteristics"""
        volatility = data.get('volatility', 0)
        market_cap = data.get('market_cap', 0)
        
        if volatility > 40 or market_cap < 1e9:  # Small cap or very volatile
            return 'HIGH'
        elif volatility > 25 or market_cap < 10e9:  # Mid cap or moderately volatile
            return 'MEDIUM'
        else:
            return 'LOW'
    
    def _determine_time_horizon(self, risk_profile: str) -> str:
        """Determine recommended time horizon"""
        if risk_profile == 'conservative':
            return '12-24 months'
        elif risk_profile == 'aggressive':
            return '3-6 months'
        else:
            return '6-12 months'
    
    def _calculate_portfolio_volatility(self, holdings: List[Dict], market_data: Dict) -> float:
        """Calculate portfolio volatility"""
        if not holdings:
            return 0
        
        total_value = sum(holding.get('market_value', 0) for holding in holdings)
        if total_value == 0:
            return 0
        
        portfolio_variance = 0
        for holding in holdings:
            symbol = holding.get('symbol')
            weight = holding.get('market_value', 0) / total_value
            
            if symbol in market_data:
                volatility = market_data[symbol].get('volatility', 0) / 100
                portfolio_variance += (weight ** 2) * (volatility ** 2)
        
        return np.sqrt(portfolio_variance) * 100  # Return as percentage
    
    def predict_price_movement(self, symbol: str, time_horizon: int = 30) -> Dict:
        """Predict stock price movement using ML models"""
        try:
            # Fetch historical data
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period="2y")
            
            if hist.empty:
                raise ValueError(f"No historical data available for {symbol}")
            
            # Prepare features
            features = self._prepare_features(hist)
            
            # Train model if not exists
            if symbol not in self.models:
                self._train_model(symbol, features)
            
            # Make prediction
            prediction = self._make_prediction(symbol, features, time_horizon)
            
            return {
                'symbol': symbol,
                'current_price': hist['Close'].iloc[-1],
                'predicted_price': prediction['price'],
                'confidence': prediction['confidence'],
                'direction': prediction['direction'],
                'time_horizon': time_horizon
            }
            
        except Exception as e:
            logger.error(f"Error predicting price for {symbol}: {str(e)}")
            raise
    
    def _prepare_features(self, hist: pd.DataFrame) -> pd.DataFrame:
        """Prepare features for ML model"""
        features = pd.DataFrame()
        
        # Price features
        features['close'] = hist['Close']
        features['volume'] = hist['Volume']
        features['high'] = hist['High']
        features['low'] = hist['Low']
        
        # Technical indicators
        features['sma_20'] = hist['Close'].rolling(20).mean()
        features['sma_50'] = hist['Close'].rolling(50).mean()
        features['rsi'] = self._calculate_rsi(hist['Close'])
        features['macd'] = self._calculate_macd(hist['Close'])
        
        # Price changes
        features['price_change_1d'] = hist['Close'].pct_change(1)
        features['price_change_5d'] = hist['Close'].pct_change(5)
        features['price_change_20d'] = hist['Close'].pct_change(20)
        
        # Volatility
        features['volatility_20d'] = hist['Close'].pct_change().rolling(20).std()
        
        return features.dropna()
    
    def _calculate_rsi(self, prices: pd.Series, period: int = 14) -> pd.Series:
        """Calculate RSI indicator"""
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi
    
    def _calculate_macd(self, prices: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9) -> pd.Series:
        """Calculate MACD indicator"""
        ema_fast = prices.ewm(span=fast).mean()
        ema_slow = prices.ewm(span=slow).mean()
        macd = ema_fast - ema_slow
        return macd
    
    def _train_model(self, symbol: str, features: pd.DataFrame):
        """Train ML model for price prediction"""
        # Prepare target variable (future price change)
        target = features['close'].shift(-1) / features['close'] - 1
        
        # Remove last row (no future price)
        X = features[:-1]
        y = target[:-1]
        
        # Scale features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Train model
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X_scaled, y)
        
        # Store model and scaler
        self.models[symbol] = model
        self.scalers[symbol] = scaler
    
    def _make_prediction(self, symbol: str, features: pd.DataFrame, time_horizon: int) -> Dict:
        """Make price prediction using trained model"""
        if symbol not in self.models:
            raise ValueError(f"No trained model for {symbol}")
        
        # Get latest features
        latest_features = features.iloc[-1:].values
        latest_features_scaled = self.scalers[symbol].transform(latest_features)
        
        # Make prediction
        prediction = self.models[symbol].predict(latest_features_scaled)[0]
        
        # Calculate confidence based on model performance
        confidence = min(85, max(50, abs(prediction) * 1000))
        
        return {
            'price': latest_features[0][0] * (1 + prediction),
            'confidence': confidence,
            'direction': 'UP' if prediction > 0 else 'DOWN'
        }

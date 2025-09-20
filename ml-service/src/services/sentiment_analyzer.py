import numpy as np
import pandas as pd
from typing import Dict, List, Optional
import requests
from textblob import TextBlob
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class SentimentAnalyzer:
    """Market sentiment analysis from news and social media"""
    
    def __init__(self):
        self.news_api_key = None  # Would be loaded from environment
        self.sentiment_thresholds = {
            'positive': 0.1,
            'negative': -0.1
        }
        
    def analyze_sentiment(
        self,
        text_data: List[str],
        symbols: List[str] = None
    ) -> Dict:
        """Analyze sentiment from text data"""
        
        try:
            if not text_data:
                return self._empty_sentiment_result()
            
            # Analyze sentiment for each text
            sentiment_scores = []
            for text in text_data:
                score = self._analyze_text_sentiment(text)
                sentiment_scores.append(score)
            
            # Calculate overall sentiment
            overall_sentiment = self._calculate_overall_sentiment(sentiment_scores)
            
            # Analyze by symbols if provided
            symbol_sentiment = {}
            if symbols:
                symbol_sentiment = self._analyze_symbol_sentiment(text_data, symbols)
            
            # Generate sentiment insights
            insights = self._generate_sentiment_insights(overall_sentiment, sentiment_scores)
            
            return {
                'overall_sentiment': overall_sentiment,
                'sentiment_scores': sentiment_scores,
                'symbol_sentiment': symbol_sentiment,
                'insights': insights,
                'analysis_timestamp': datetime.now().isoformat(),
                'data_points': len(text_data)
            }
            
        except Exception as e:
            logger.error(f"Error analyzing sentiment: {str(e)}")
            raise
    
    def _analyze_text_sentiment(self, text: str) -> Dict:
        """Analyze sentiment of individual text"""
        try:
            # Use TextBlob for sentiment analysis
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity  # -1 to 1
            subjectivity = blob.sentiment.subjectivity  # 0 to 1
            
            # Classify sentiment
            if polarity > self.sentiment_thresholds['positive']:
                sentiment_label = 'POSITIVE'
            elif polarity < self.sentiment_thresholds['negative']:
                sentiment_label = 'NEGATIVE'
            else:
                sentiment_label = 'NEUTRAL'
            
            # Calculate confidence
            confidence = abs(polarity) * 100
            
            return {
                'text': text[:100] + '...' if len(text) > 100 else text,
                'polarity': round(polarity, 3),
                'subjectivity': round(subjectivity, 3),
                'sentiment': sentiment_label,
                'confidence': round(confidence, 1)
            }
            
        except Exception as e:
            logger.warning(f"Error analyzing text sentiment: {str(e)}")
            return {
                'text': text[:100] + '...' if len(text) > 100 else text,
                'polarity': 0.0,
                'subjectivity': 0.5,
                'sentiment': 'NEUTRAL',
                'confidence': 0.0
            }
    
    def _calculate_overall_sentiment(self, sentiment_scores: List[Dict]) -> Dict:
        """Calculate overall sentiment from individual scores"""
        if not sentiment_scores:
            return {'sentiment': 'NEUTRAL', 'score': 0.0, 'confidence': 0.0}
        
        # Calculate weighted average
        polarities = [score['polarity'] for score in sentiment_scores]
        confidences = [score['confidence'] for score in sentiment_scores]
        
        # Weight by confidence
        if sum(confidences) > 0:
            weighted_polarity = sum(p * c for p, c in zip(polarities, confidences)) / sum(confidences)
        else:
            weighted_polarity = np.mean(polarities)
        
        # Classify overall sentiment
        if weighted_polarity > self.sentiment_thresholds['positive']:
            sentiment_label = 'POSITIVE'
        elif weighted_polarity < self.sentiment_thresholds['negative']:
            sentiment_label = 'NEGATIVE'
        else:
            sentiment_label = 'NEUTRAL'
        
        # Calculate overall confidence
        overall_confidence = abs(weighted_polarity) * 100
        
        # Count sentiment distribution
        sentiment_counts = {'POSITIVE': 0, 'NEGATIVE': 0, 'NEUTRAL': 0}
        for score in sentiment_scores:
            sentiment_counts[score['sentiment']] += 1
        
        return {
            'sentiment': sentiment_label,
            'score': round(weighted_polarity, 3),
            'confidence': round(overall_confidence, 1),
            'distribution': sentiment_counts,
            'total_articles': len(sentiment_scores)
        }
    
    def _analyze_symbol_sentiment(self, text_data: List[str], symbols: List[str]) -> Dict:
        """Analyze sentiment for specific symbols"""
        symbol_sentiment = {}
        
        for symbol in symbols:
            # Find texts mentioning the symbol
            symbol_texts = []
            for text in text_data:
                if symbol.lower() in text.lower():
                    symbol_texts.append(text)
            
            if symbol_texts:
                # Analyze sentiment for symbol-specific texts
                symbol_scores = []
                for text in symbol_texts:
                    score = self._analyze_text_sentiment(text)
                    symbol_scores.append(score)
                
                # Calculate symbol sentiment
                symbol_overall = self._calculate_overall_sentiment(symbol_scores)
                symbol_sentiment[symbol] = {
                    'sentiment': symbol_overall['sentiment'],
                    'score': symbol_overall['score'],
                    'confidence': symbol_overall['confidence'],
                    'mention_count': len(symbol_texts),
                    'distribution': symbol_overall['distribution']
                }
            else:
                symbol_sentiment[symbol] = {
                    'sentiment': 'NEUTRAL',
                    'score': 0.0,
                    'confidence': 0.0,
                    'mention_count': 0,
                    'distribution': {'POSITIVE': 0, 'NEGATIVE': 0, 'NEUTRAL': 0}
                }
        
        return symbol_sentiment
    
    def _generate_sentiment_insights(self, overall_sentiment: Dict, sentiment_scores: List[Dict]) -> List[str]:
        """Generate insights from sentiment analysis"""
        insights = []
        
        sentiment = overall_sentiment['sentiment']
        score = overall_sentiment['score']
        confidence = overall_sentiment['confidence']
        
        # Overall sentiment insights
        if sentiment == 'POSITIVE' and confidence > 70:
            insights.append("Strong positive market sentiment detected")
        elif sentiment == 'NEGATIVE' and confidence > 70:
            insights.append("Strong negative market sentiment detected")
        elif sentiment == 'NEUTRAL':
            insights.append("Mixed or neutral market sentiment")
        
        # Confidence insights
        if confidence < 30:
            insights.append("Low confidence in sentiment analysis - mixed signals")
        elif confidence > 80:
            insights.append("High confidence in sentiment analysis")
        
        # Distribution insights
        distribution = overall_sentiment['distribution']
        total = sum(distribution.values())
        if total > 0:
            positive_pct = (distribution['POSITIVE'] / total) * 100
            negative_pct = (distribution['NEGATIVE'] / total) * 100
            
            if positive_pct > 60:
                insights.append("Majority of content shows positive sentiment")
            elif negative_pct > 60:
                insights.append("Majority of content shows negative sentiment")
            else:
                insights.append("Balanced mix of positive and negative sentiment")
        
        # Volatility insights
        polarities = [score['polarity'] for score in sentiment_scores]
        if len(polarities) > 1:
            polarity_std = np.std(polarities)
            if polarity_std > 0.3:
                insights.append("High sentiment volatility - mixed market opinions")
            elif polarity_std < 0.1:
                insights.append("Low sentiment volatility - consistent market opinion")
        
        return insights if insights else ["Sentiment analysis completed"]
    
    def analyze_news_sentiment(
        self,
        news_articles: List[Dict],
        symbols: List[str] = None
    ) -> Dict:
        """Analyze sentiment from news articles"""
        try:
            if not news_articles:
                return self._empty_sentiment_result()
            
            # Extract text from articles
            text_data = []
            for article in news_articles:
                # Combine title and content
                text = f"{article.get('title', '')} {article.get('content', '')}"
                text_data.append(text)
            
            # Analyze sentiment
            sentiment_result = self.analyze_sentiment(text_data, symbols)
            
            # Add news-specific insights
            sentiment_result['news_insights'] = self._generate_news_insights(news_articles, sentiment_result)
            
            return sentiment_result
            
        except Exception as e:
            logger.error(f"Error analyzing news sentiment: {str(e)}")
            raise
    
    def _generate_news_insights(self, news_articles: List[Dict], sentiment_result: Dict) -> List[str]:
        """Generate news-specific insights"""
        insights = []
        
        # Source analysis
        sources = [article.get('source', 'Unknown') for article in news_articles]
        source_counts = pd.Series(sources).value_counts()
        
        if len(source_counts) > 0:
            top_source = source_counts.index[0]
            insights.append(f"Most articles from {top_source} ({source_counts.iloc[0]} articles)")
        
        # Time analysis
        recent_articles = 0
        for article in news_articles:
            published_at = article.get('publishedAt')
            if published_at:
                try:
                    pub_date = datetime.fromisoformat(published_at.replace('Z', '+00:00'))
                    if pub_date > datetime.now() - timedelta(hours=24):
                        recent_articles += 1
                except:
                    continue
        
        if recent_articles > 0:
            insights.append(f"{recent_articles} articles published in the last 24 hours")
        
        # Sentiment trend
        sentiment = sentiment_result['overall_sentiment']['sentiment']
        if sentiment == 'POSITIVE':
            insights.append("Recent news sentiment is bullish")
        elif sentiment == 'NEGATIVE':
            insights.append("Recent news sentiment is bearish")
        else:
            insights.append("Recent news sentiment is mixed")
        
        return insights
    
    def get_market_sentiment_summary(self) -> Dict:
        """Get overall market sentiment summary"""
        try:
            # This would typically fetch real-time news data
            # For now, return a mock summary
            
            return {
                'overall_sentiment': 'NEUTRAL',
                'sentiment_score': 0.05,
                'confidence': 65.0,
                'market_outlook': 'Mixed signals with slight positive bias',
                'key_themes': [
                    'Interest rate concerns',
                    'Earnings season optimism',
                    'Geopolitical tensions'
                ],
                'sector_sentiment': {
                    'Technology': 'POSITIVE',
                    'Healthcare': 'NEUTRAL',
                    'Financial': 'NEGATIVE',
                    'Energy': 'POSITIVE'
                },
                'last_updated': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting market sentiment summary: {str(e)}")
            return self._empty_sentiment_result()
    
    def _empty_sentiment_result(self) -> Dict:
        """Return empty sentiment result structure"""
        return {
            'overall_sentiment': {
                'sentiment': 'NEUTRAL',
                'score': 0.0,
                'confidence': 0.0,
                'distribution': {'POSITIVE': 0, 'NEGATIVE': 0, 'NEUTRAL': 0},
                'total_articles': 0
            },
            'sentiment_scores': [],
            'symbol_sentiment': {},
            'insights': ['No data available for sentiment analysis'],
            'analysis_timestamp': datetime.now().isoformat(),
            'data_points': 0
        }

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Import ML services
from services.recommendation_engine import RecommendationEngine
from services.portfolio_optimizer import PortfolioOptimizer
from services.risk_assessor import RiskAssessor
from services.sentiment_analyzer import SentimentAnalyzer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Initialize ML services
recommendation_engine = RecommendationEngine()
portfolio_optimizer = PortfolioOptimizer()
risk_assessor = RiskAssessor()
sentiment_analyzer = SentimentAnalyzer()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'OK',
        'service': 'ML Service',
        'version': '1.0.0'
    })

@app.route('/api/recommendations/generate', methods=['POST'])
def generate_recommendations():
    """Generate personalized investment recommendations"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        risk_profile = data.get('risk_profile')
        portfolio_data = data.get('portfolio_data', {})
        
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        recommendations = recommendation_engine.generate_recommendations(
            user_id=user_id,
            risk_profile=risk_profile,
            portfolio_data=portfolio_data
        )
        
        return jsonify({
            'success': True,
            'data': recommendations,
            'message': 'Recommendations generated successfully'
        })
        
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/portfolio/optimize', methods=['POST'])
def optimize_portfolio():
    """Optimize portfolio using Modern Portfolio Theory"""
    try:
        data = request.get_json()
        current_holdings = data.get('current_holdings', [])
        risk_tolerance = data.get('risk_tolerance', 'moderate')
        time_horizon = data.get('time_horizon', 5)
        
        optimization_result = portfolio_optimizer.optimize_portfolio(
            current_holdings=current_holdings,
            risk_tolerance=risk_tolerance,
            time_horizon=time_horizon
        )
        
        return jsonify({
            'success': True,
            'data': optimization_result,
            'message': 'Portfolio optimized successfully'
        })
        
    except Exception as e:
        logger.error(f"Error optimizing portfolio: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/risk/assess', methods=['POST'])
def assess_risk():
    """Assess portfolio risk metrics"""
    try:
        data = request.get_json()
        portfolio_data = data.get('portfolio_data', {})
        market_data = data.get('market_data', {})
        
        risk_metrics = risk_assessor.calculate_risk_metrics(
            portfolio_data=portfolio_data,
            market_data=market_data
        )
        
        return jsonify({
            'success': True,
            'data': risk_metrics,
            'message': 'Risk assessment completed successfully'
        })
        
    except Exception as e:
        logger.error(f"Error assessing risk: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/sentiment/analyze', methods=['POST'])
def analyze_sentiment():
    """Analyze market sentiment from news and social media"""
    try:
        data = request.get_json()
        text_data = data.get('text_data', [])
        symbols = data.get('symbols', [])
        
        sentiment_results = sentiment_analyzer.analyze_sentiment(
            text_data=text_data,
            symbols=symbols
        )
        
        return jsonify({
            'success': True,
            'data': sentiment_results,
            'message': 'Sentiment analysis completed successfully'
        })
        
    except Exception as e:
        logger.error(f"Error analyzing sentiment: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/predict/price', methods=['POST'])
def predict_price():
    """Predict stock price movements"""
    try:
        data = request.get_json()
        symbol = data.get('symbol')
        time_horizon = data.get('time_horizon', 30)  # days
        
        if not symbol:
            return jsonify({'error': 'symbol is required'}), 400
        
        prediction = recommendation_engine.predict_price_movement(
            symbol=symbol,
            time_horizon=time_horizon
        )
        
        return jsonify({
            'success': True,
            'data': prediction,
            'message': 'Price prediction completed successfully'
        })
        
    except Exception as e:
        logger.error(f"Error predicting price: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    logger.info(f"Starting ML Service on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)

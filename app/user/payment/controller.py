# user/payment/controller.py
from flask import request, jsonify, current_app, g
from . import payment_bp
from .models import Payment
import hmac
import hashlib
import os

# Store Maya sandbox IPs to make sure webhooks only come from these addresses
MAYA_SANDBOX_IPS = ['13.229.160.234', '3.1.199.75']


@payment_bp.before_request
def verify_maya_ip():
    """Verify request comes from Maya servers"""
    # Skip IP verification for non-webhook routes if needed
    if request.endpoint != 'payment.maya_webhook':
        return
    
    client_ip = request.headers.get('X-Forwarded-For', request.remote_addr)
    if ',' in client_ip:
        client_ip = client_ip.split(',')[0].strip()
    
    if client_ip not in MAYA_SANDBOX_IPS:
        try:
            current_app.logger.warning(f"Blocked webhook from unauthorized IP: {client_ip}")
        except RuntimeError:
            # Fallback if app context not available
            print(f"Blocked webhook from unauthorized IP: {client_ip}")
        return jsonify({'error': 'Unauthorized'}), 403


@payment_bp.route('/maya/webhook', methods=['POST'])
def maya_webhook():
    """Handle Maya payment webhook"""
    try:
        maya_signature = request.headers.get('PayMaya-Signature')
        
        if not verify_signature(request.data, maya_signature):
            current_app.logger.warning("Invalid webhook signature")
            return jsonify({'error': 'Invalid signature'}), 401
        
        payload = request.get_json()
        current_app.logger.info(f"Maya Webhook Payload: {payload}")
        
        status = payload.get('status')
        tracking_number = payload.get('trackingNumber')
        payment_id = payload.get('id')
        amount = payload.get('totalAmount', {}).get('value')
        student_id = payload.get('studentId') or payload.get('metadata', {}).get('studentId')
        
        if status == 'PAYMENT_SUCCESS' and tracking_number:
            # Process payment
            result = Payment.process_webhook_payment(tracking_number, amount, student_id)
            
            if result['success']:
                current_app.logger.info(
                    f"Payment confirmed: {tracking_number}, Payment ID: {payment_id}"
                )
            else:
                current_app.logger.warning(
                    f"Payment processing failed for {tracking_number}: {result['message']}"
                )
        
        return jsonify({'success': True}), 200
        
    except Exception as e:
        current_app.logger.error(f"Webhook error: {str(e)}")
        # Return success to prevent Maya from retrying for transient errors
        return jsonify({'success': True}), 200


def verify_signature(payload_bytes, signature):
    """Verify webhook signature"""
    if not signature:
        return False
    
    secret_key = os.getenv('MAYA_SECRET_KEY')
    if not secret_key:
        current_app.logger.error("MAYA_SECRET_KEY not configured")
        return False
    
    expected = hmac.new(
        secret_key.encode('utf-8'),
        payload_bytes,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected)
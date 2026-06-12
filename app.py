from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import hashlib
import secrets
from cashfree_pg.models.create_order_request import CreateOrderRequest
from cashfree_pg.api_client import Cashfree
from cashfree_pg.models.customer_details import CustomerDetails
from cashfree_pg.models.order_meta import OrderMeta
import dotenv
import urllib3
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

dotenv.load_dotenv()

app = Flask(__name__)
CORS(app)

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
retry_strategy = Retry(
    total=3,
    backoff_factor=1,
    status_forcelist=[500, 502, 503, 504]
)
adapter = HTTPAdapter(max_retries=retry_strategy)
http = requests.Session()
http.mount("https://", adapter)

Cashfree.XClientId = os.getenv('CASHFREE_APP_ID')
Cashfree.XClientSecret = os.getenv('CASHFREE_SECRET_KEY')
Cashfree.XEnvironment = Cashfree.PRODUCTION

if not Cashfree.XClientId or not Cashfree.XClientSecret:
    raise ValueError("Cashfree credentials not properly configured")

def generate_order_id():
    unique_id = secrets.token_hex(16)
    hash_obj = hashlib.sha256(unique_id.encode())
    order_id = hash_obj.hexdigest()
    return order_id[:12]

@app.route('/')
def index():
    return 'Hello World!'

@app.route('/payment', methods=['GET'])
def payment():
    try:
        # Get parameters from request with validation
        amount = request.args.get('amount')
        customer_name = request.args.get('customerName')
        customer_email = request.args.get('customerEmail')
        customer_phone = request.args.get('customerPhone')
        
        print(f"Received payment request with params: amount={amount}, name={customer_name}, email={customer_email}, phone={customer_phone}")
        
        if not all([amount, customer_name, customer_email, customer_phone]):
            missing_fields = [field for field, value in {
                'amount': amount,
                'customerName': customer_name,
                'customerEmail': customer_email,
                'customerPhone': customer_phone
            }.items() if not value]
            return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
            
        try:
            amount = float(amount)
            if amount <= 0:
                return jsonify({"error": "Invalid amount"}), 400
        except ValueError:
            return jsonify({"error": "Invalid amount format"}), 400
            
        order_id = generate_order_id()
        
        try:
            customer_details = CustomerDetails(
                customer_id=f"CUST_{order_id}",
                customer_phone=str(customer_phone).strip(),
                customer_name=str(customer_name).strip(),
                customer_email=str(customer_email).strip()
            )
        except Exception as e:
            print(f"Error creating customer details: {str(e)}")
            return jsonify({"error": "Invalid customer details"}), 400
        
        # Create order meta
        try:
            order_meta = OrderMeta(
                return_url="https://www.careerhubs.info/payment/status?order_id={order_id}"
            )
        except Exception as e:
            print(f"Error creating order meta: {str(e)}")
            return jsonify({"error": "Invalid order meta"}), 400
        
        try:
            create_order_request = CreateOrderRequest(
                order_amount=amount,
                order_currency="INR",
                order_id=order_id,
                customer_details=customer_details,
                order_meta=order_meta
            )
        except Exception as e:
            print(f"Error creating order request: {str(e)}")
            return jsonify({"error": "Invalid order request"}), 400
        
        try:
            api_response = Cashfree().PGCreateOrder("2023-08-01", create_order_request)
            if not api_response:
                raise ValueError("No response received from Cashfree API")
            if not api_response.data:
                raise ValueError("Invalid response data from Cashfree API")
                
            response_data = {
                "order_id": api_response.data.order_id,
                "order_amount": api_response.data.order_amount,
                "order_currency": api_response.data.order_currency,
                "payment_session_id": api_response.data.payment_session_id,
                "order_status": api_response.data.order_status
            }
            
            if not all(response_data.values()):
                raise ValueError("Missing required fields in API response")
                
            return jsonify(response_data)
            
        except Exception as e:
            print(f"Cashfree API error: {str(e)}")
            return jsonify({"error": f"Payment processing failed: {str(e)}"}), 500
            
    except Exception as error:
        print(f"Error processing payment: {str(error)}")
        return jsonify({"error": str(error)}), 500

@app.route('/verify', methods=['POST'])
def verify():
    try:
        data = request.get_json()
        order_id = data.get('orderId')
        
        if not order_id:
            return jsonify({"error": "Order ID is required"}), 400
            
        print(f"Verifying order: {order_id}")
        
        try:
            api_response = Cashfree().PGFetchOrder("2023-08-01", order_id)
            
            if not api_response or not api_response.data:
                print(f"Invalid API response for order {order_id}")
                return jsonify({"error": "Invalid response from payment gateway"}), 500
                
            response_data = {
                "order_id": api_response.data.order_id,
                "order_status": api_response.data.order_status,
                "payment_details": None  
            }
            
            try:
                if hasattr(api_response.data, 'payment_details'):
                    response_data['payment_details'] = {
                        "payment_method": getattr(api_response.data.payment_details, 'payment_method', None),
                        "payment_amount": getattr(api_response.data.payment_details, 'payment_amount', None)
                    }
                else:
                    print(f"No payment details available for order {order_id}")
                    
            except Exception as e:
                print(f"Error extracting payment details: {str(e)}")
                
            print(f"Verification response: {response_data}")
            
            return jsonify(response_data)
            
        except Exception as error:
            print(f"Error fetching order details: {str(error)}")
            return jsonify({"error": f"Payment verification failed: {str(error)}"}), 500
            
    except Exception as error:
        print(f"Error in verify endpoint: {str(error)}")
        return jsonify({"error": "Payment verification failed"}), 500

if __name__ == '__main__':
    app.run(port=8000)
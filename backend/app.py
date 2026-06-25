from flask import Flask
from flask_cors import CORS
from routes.fidelidade import fidelidade_bp
from routes.produtos import produtos_bp
from routes.pedidos import pedidos_bp
from routes.funcionamento import funcionamento_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(fidelidade_bp)
app.register_blueprint(produtos_bp)
app.register_blueprint(pedidos_bp)
app.register_blueprint(funcionamento_bp)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
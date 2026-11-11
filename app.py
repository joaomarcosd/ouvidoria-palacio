from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)

# Função para criar o banco de dados SQLite automaticamente
def init_db():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS denuncias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tipo TEXT NOT NULL,
            nome TEXT,
            email TEXT,
            cep TEXT,
            mensagem TEXT NOT NULL,
            data_envio DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

# Inicializa o banco de dados ao subir o app
init_db()

# Rota principal (carrega a página do site)
@app.route('/')
def home():
    return render_template('index.html')

# API REST interna para receber e salvar os relatos
@app.route('/api/denuncia', methods=['POST'])
def salvar_denuncia():
    data = request.get_json()
    if not data or not data.get('tipo') or not data.get('mensagem'):
        return jsonify({"status": "erro", "mensagem": "Campos obrigatórios ausentes."}), 400

    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO denuncias (tipo, nome, email, cep, mensagem)
        VALUES (?, ?, ?, ?, ?)
    ''', (data.get('tipo'), data.get('nome'), data.get('email'), data.get('cep'), data.get('mensagem')))
    conn.commit()
    conn.close()

    return jsonify({"status": "sucesso", "mensagem": "Denúncia registrada com sucesso!"}), 201

if __name__ == '__main__':
    app.run(debug=True)
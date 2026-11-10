import os
import sqlite3
from flask import Flask, render_template, request, jsonify, session, redirect, url_for

app = Flask(__name__)
app.secret_key = 'palacio_ferramentas_segredo_2026'

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'database.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
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

init_db()

@app.route('/')
def home():
    return render_template('index.html')

# Rota para o login do gestor
@app.route('/login', methods=['GET', 'POST'])
def login():
    erro = None
    if request.method == 'POST':
        senha = request.form.get('senha')
        if senha == 'teste2026':
            session['gestor_autenticado'] = True
            return redirect(url_for('admin'))
        else:
            erro = "Senha incorreta. Tente novamente."
    return render_template('login.html', erro=erro)

@app.route('/logout')
def logout():
    session.pop('gestor_autenticado', None)
    return redirect(url_for('home'))

# Rota protegida do painel do gestor
@app.route('/admin')
def admin():
    if not session.get('gestor_autenticado'):
        return redirect(url_for('login'))
        
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM denuncias ORDER BY data_envio DESC')
    registros = cursor.fetchall()
    conn.close()
    return render_template('admin.html', registros=registros)

@app.route('/api/denuncia', methods=['POST'])
def salvar_denuncia():
    data = request.get_json()
    if not data or not data.get('tipo') or not data.get('mensagem'):
        return jsonify({"status": "erro", "mensagem": "Campos obrigatórios ausentes."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO denuncias (tipo, nome, email, cep, mensagem)
        VALUES (?, ?, ?, ?, ?)
    ''', (data.get('tipo'), data.get('nome'), data.get('email'), data.get('cep'), data.get('mensagem')))
    conn.commit()
    conn.close()

    return jsonify({"status": "sucesso", "mensagem": "Registro enviado com sucesso."}), 201

if __name__ == '__main__':
    app.run(debug=True)
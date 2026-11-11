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
    
    # Cria a tabela garantindo o campo status
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS denuncias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tipo TEXT NOT NULL,
            nome TEXT,
            email TEXT,
            local_trabalho TEXT,
            mensagem TEXT NOT NULL,
            status TEXT DEFAULT 'Pendente',
            data_envio DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Garante a coluna 'status' caso o banco já existisse antes
    try:
        cursor.execute("ALTER TABLE denuncias ADD COLUMN status TEXT DEFAULT 'Pendente'")
    except sqlite3.OperationalError:
        pass # Coluna já existe

    conn.commit()
    conn.close()

init_db()

@app.route('/')
def home():
    return render_template('index.html')

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
        INSERT INTO denuncias (tipo, nome, email, local_trabalho, mensagem, status)
        VALUES (?, ?, ?, ?, ?, 'Pendente')
    ''', (data.get('tipo'), data.get('nome'), data.get('email'), data.get('local_trabalho'), data.get('mensagem')))
    conn.commit()
    conn.close()

    return jsonify({"status": "sucesso", "mensagem": "Registro enviado com sucesso."}), 201

# Rota para atualizar o status do registro via painel do gestor
@app.route('/api/denuncia/status', methods=['POST'])
def atualizar_status():
    if not session.get('gestor_autenticado'):
        return jsonify({"status": "erro", "mensagem": "Não autorizado"}), 401
        
    data = request.get_json()
    registro_id = data.get('id')
    novo_status = data.get('status')

    if not registro_id or not novo_status:
        return jsonify({"status": "erro", "mensagem": "Parâmetros inválidos."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE denuncias SET status = ? WHERE id = ?', (novo_status, registro_id))
    conn.commit()
    conn.close()

    return jsonify({"status": "sucesso", "mensagem": "Status atualizado."})

if __name__ == '__main__':
    app.run(debug=True)
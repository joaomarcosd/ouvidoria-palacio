import pytest
from app import app

@pytest.fixture
def client():
    # Configura o aplicativo para o modo de teste
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_home_status_code(client):
    """Testa se a página principal (home) carrega com o código 200 (Sucesso)"""
    response = client.get('/')
    assert response.status_code == 200

def test_envio_denuncia_valida(client):
    """Testa se a API envia e salva uma denúncia válida corretamente"""
    payload = {
        "tipo": "Segurança no Trabalho",
        "nome": "Usuário Teste",
        "email": "teste@exemplo.com",
        "cep": "01001000",
        "mensagem": "Denúncia gerada pelo script de teste automático."
    }
    response = client.post('/api/denuncia', json=payload)
    assert response.status_code == 201
    assert response.json['status'] == 'sucesso'

def test_envio_denuncia_invalida(client):
    """Testa a validação de erro ao tentar enviar formulário sem os campos obrigatórios"""
    payload = {
        "nome": "Usuário Sem Tipo"
        # Sem 'tipo' e sem 'mensagem'
    }
    response = client.post('/api/denuncia', json=payload)
    assert response.status_code == 400
    assert response.json['status'] == 'erro'
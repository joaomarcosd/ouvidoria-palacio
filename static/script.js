// Preenchimento automático do tipo ao clicar nos botões da página
function selecionarTipo(tipo) {
    const select = document.getElementById('tipo');
    select.value = tipo;
    
    // Rolagem suave diretamente até o formulário
    document.getElementById('formulario-section').scrollIntoView({ behavior: 'smooth' });
}

// Requisito de API Externa: Busca de endereço automática via ViaCEP
document.getElementById('cep').addEventListener('blur', function() {
    let cep = this.value.replace(/\D/g, '');
    if (cep.length === 8) {
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => response.json())
            .then(data => {
                if (!data.erro) {
                    document.getElementById('endereco-info').innerText = 
                        `Localização sugerida: ${data.logradouro}, ${data.bairro} - ${data.localidade}/${data.uf}`;
                } else {
                    document.getElementById('endereco-info').innerText = 'CEP não encontrado.';
                }
            })
            .catch(() => {
                document.getElementById('endereco-info').innerText = 'Erro ao buscar o CEP.';
            });
    }
});

// Envio do formulário via API REST interna usando JS (Fetch)
document.getElementById('formOuvidoria').addEventListener('submit', function(e) {
    e.preventDefault();

    const payload = {
        tipo: document.getElementById('tipo').value,
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        cep: document.getElementById('cep').value,
        mensagem: document.getElementById('mensagem').value
    };

    fetch('/api/denuncia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        const divResposta = document.getElementById('resposta-envio');
        if (data.status === 'sucesso') {
            divResposta.className = 'sucesso';
            divResposta.innerText = data.mensagem;
            document.getElementById('formOuvidoria').reset();
            document.getElementById('endereco-info').innerText = '';
        } else {
            divResposta.className = 'erro';
            divResposta.innerText = data.mensagem;
        }
    });
});
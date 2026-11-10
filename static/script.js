document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formOuvidoria');
    const inputCep = document.getElementById('cep');
    const enderecoInfo = document.getElementById('endereco-info');
    const respostaEnvio = document.getElementById('resposta-envio');

    // Integração com API ViaCEP (API Externa)
    if (inputCep) {
        inputCep.addEventListener('blur', async () => {
            const cep = inputCep.value.replace(/\D/g, '');
            if (cep.length === 8) {
                enderecoInfo.textContent = 'Buscando endereço...';
                try {
                    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const data = await response.json();
                    if (!data.erro) {
                        enderecoInfo.textContent = `Endereço: ${data.logradouro}, ${data.bairro} - ${data.localidade}/${data.uf}`;
                        enderecoInfo.style.color = '#103681';
                    } else {
                        enderecoInfo.textContent = 'CEP não encontrado.';
                        enderecoInfo.style.color = 'red';
                    }
                } catch (error) {
                    enderecoInfo.textContent = 'Erro ao consultar CEP.';
                    enderecoInfo.style.color = 'red';
                }
            } else if (cep.length > 0) {
                enderecoInfo.textContent = 'CEP inválido. Digite 8 números.';
                enderecoInfo.style.color = 'red';
            }
        });
    }

    // Envio do formulário via API REST (Flask)
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Pega os elementos do formulário
            const tipoSelect = document.getElementById('tipo');
            const nomeInput = document.getElementById('nome');
            const emailInput = document.getElementById('email');
            const mensagemInput = document.getElementById('mensagem');

            // Prepara os dados JSON
            const payload = {
                tipo: tipoSelect ? tipoSelect.value : '',
                nome: nomeInput ? nomeInput.value : '',
                email: emailInput ? emailInput.value : '',
                cep: inputCep ? inputCep.value : '',
                mensagem: mensagemInput ? mensagemInput.value : ''
            };

            respostaEnvio.textContent = 'Enviando registro...';
            respostaEnvio.className = '';

            try {
                const response = await fetch('/api/denuncia', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (response.ok) {
                    respostaEnvio.textContent = '✅ ' + result.mensagem;
                    respostaEnvio.className = 'sucesso';
                    form.reset();
                    if (enderecoInfo) enderecoInfo.textContent = '';
                } else {
                    respostaEnvio.textContent = '❌ ' + (result.mensagem || 'Erro ao enviar registro.');
                    respostaEnvio.className = 'erro';
                }
            } catch (error) {
                respostaEnvio.textContent = '❌ Erro de conexão com o servidor.';
                respostaEnvio.className = 'erro';
            }
        });
    }
});
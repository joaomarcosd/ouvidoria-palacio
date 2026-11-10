document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formOuvidoria');
    const inputCep = document.getElementById('cep');
    const enderecoInfo = document.getElementById('endereco-info');
    const bannerSucesso = document.getElementById('banner-sucesso');
    const respostaEnvio = document.getElementById('resposta-envio');

    // API ViaCEP
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
            }
        });
    }

    // Envio do Formulário
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const payload = {
                tipo: document.getElementById('tipo').value,
                nome: document.getElementById('nome').value,
                email: document.getElementById('email').value,
                cep: inputCep ? inputCep.value : '',
                mensagem: document.getElementById('mensagem').value
            };

            try {
                const response = await fetch('/api/denuncia', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    // Exibe o banner verde no topo
                    bannerSucesso.classList.remove('hidden');
                    window.scrollTo({ top: 0, behavior: 'smooth' });

                    // Esconde o banner após 5 segundos
                    setTimeout(() => {
                        bannerSucesso.classList.add('hidden');
                    }, 5000);

                    form.reset();
                    if (enderecoInfo) enderecoInfo.textContent = '';
                    if (respostaEnvio) respostaEnvio.textContent = '';
                } else {
                    const result = await response.json();
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
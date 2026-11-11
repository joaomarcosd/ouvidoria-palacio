document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formOuvidoria');
    const bannerSucesso = document.getElementById('banner-sucesso');
    const respostaEnvio = document.getElementById('resposta-envio');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const payload = {
                tipo: document.getElementById('tipo').value,
                local_trabalho: document.getElementById('local_trabalho').value,
                nome: document.getElementById('nome').value,
                email: document.getElementById('email').value,
                mensagem: document.getElementById('mensagem').value
            };

            try {
                const response = await fetch('/api/denuncia', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    bannerSucesso.classList.remove('hidden');
                    window.scrollTo({ top: 0, behavior: 'smooth' });

                    setTimeout(() => {
                        bannerSucesso.classList.add('hidden');
                    }, 5000);

                    form.reset();
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

    const statusSelects = document.querySelectorAll('.select-status');
    statusSelects.forEach(select => {
        select.addEventListener('change', async (e) => {
            const targetSelect = e.target;
            const registroId = targetSelect.getAttribute('data-id');
            const novoStatus = targetSelect.value;

            targetSelect.className = 'select-status';
            if (novoStatus === 'Pendente') {
                targetSelect.classList.add('status-pendente');
            } else if (novoStatus === 'Em andamento') {
                targetSelect.classList.add('status-em-andamento');
            } else if (novoStatus === 'Concluído') {
                targetSelect.classList.add('status-concluído');
            }

            try {
                await fetch('/api/denuncia/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: registroId, status: novoStatus })
                });
            } catch (err) {
                console.error("Erro ao atualizar status:", err);
            }
        });
    });
});
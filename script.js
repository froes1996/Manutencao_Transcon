// A URL agora aponta para o IP do seu servidor local
const API_URL = 'http://192.168.1.100:3000/ordens-servico'; // Exemplo de IP local

const form = document.getElementById('os-form');
// ... resto das seleções

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // 1. Em vez de criar um objeto JSON, criamos um FormData
    const formData = new FormData();

    // 2. Adicionamos os valores dos campos e o arquivo ao FormData
    formData.append('equipamento', document.getElementById('equipamento').value);
    formData.append('localizacao', document.getElementById('localizacao').value);
    formData.append('descricao_problema', document.getElementById('descricao_problema').value);
    formData.append('solicitante_nome', document.getElementById('solicitante').value);

    const fotoInput = document.getElementById('foto_defeito');
    if (fotoInput.files.length > 0) {
        formData.append('foto_defeito', fotoInput.files[0]);
    } else {
        // Validação simples para garantir que um arquivo foi enviado
        alert('Por favor, anexe uma foto do defeito.');
        return;
    }

    const submitButton = form.querySelector('button');
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';

    try {
        // 3. Enviamos o objeto FormData diretamente no corpo do fetch
        // IMPORTANTE: NÃO defina o header 'Content-Type'. O navegador fará isso por você.
        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData
        });

        // O resto do código para tratar a resposta (sucesso/erro) continua o mesmo...

    } catch (error) {
        // ...
    } finally {
        // ...
    }
});
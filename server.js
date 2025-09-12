const express = require('express');
const cors = require('cors');
const multer = require('multer'); // Importa o multer
const path = require('path'); // Módulo nativo para lidar com caminhos de arquivos
const app = express();

// --- CONFIGURAÇÃO DO MULTER PARA O UPLOAD ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Define a pasta onde as imagens serão salvas
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Define um nome único para o arquivo para evitar sobreposição
        // Ex: foto-defeito-1694528801.jpg
        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});

const upload = multer({ storage: storage });

// --- MIDDLEWARE ---
app.use(cors());
// O express.json() não é mais necessário para esta rota, pois não estamos recebendo JSON.
// Mas é bom manter para outras rotas que possam precisar.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota para servir os arquivos estáticos (as imagens salvas)
// Isso permite que o dashboard possa exibir as fotos depois.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- ROTA DE CRIAÇÃO DA O.S. ---
// O middleware do multer (`upload.single(...)`) processa o arquivo ANTES do nosso código.
// 'foto_defeito' deve ser o mesmo `name` do campo <input type="file">
app.post('/ordens-servico', upload.single('foto_defeito'), (req, res) => {

    // Os dados de texto agora vêm em `req.body`
    const { equipamento, localizacao, descricao_problema, solicitante_nome } = req.body;

    // As informações do arquivo salvo vêm em `req.file`
    // Se nenhum arquivo foi enviado, req.file será undefined
    if (!req.file) {
        return res.status(400).json({ message: 'A foto do defeito é obrigatória.' });
    }

    const caminhoDaFoto = req.file.path; // Ex: "uploads/foto-defeito-1694528801.jpg"

    console.log('Dados recebidos:', req.body);
    console.log('Arquivo salvo em:', caminhoDaFoto);

    // --- LÓGICA DE NEGÓCIO ---
    // 1. Salve os dados de texto E o `caminhoDaFoto` no seu banco de dados.
    // NUNCA salve a imagem em si no banco, apenas o caminho para o arquivo!

    // 2. Retorne a resposta de sucesso.
    res.status(201).json({
        message: 'Ordem de Serviço criada com sucesso!',
        dados: { ...req.body, foto: caminhoDaFoto }
    });
});

const port = 3000;
app.listen(port, '0.0.0.0', () => { // '0.0.0.0' permite acesso de outros computadores na mesma rede
    console.log(`Servidor rodando em http://localhost:${port}`);
});
/**
 * server.js (Versão com funcionalidade de Finalização de O.S.)
 */

// --- IMPORTAÇÕES E CONFIGURAÇÕES INICIAIS (sem alterações) ---
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const app = express();
const port = 3000;

// --- MIDDLEWARES (sem alterações) ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'uploads/'); },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});
const upload = multer({ storage: storage });

app.use('/uploads', express.static(uploadsDir));

// --- ROTAS DA API ---

// ROTA GET: /ordens-servico (sem alterações)
app.get('/ordens-servico', async (req, res) => {
    const { status } = req.query;
    try {
        let sql = 'SELECT * FROM ordens_servico';
        const params = [];
        if (status && status !== 'Todas') {
            sql += ' WHERE status = $1';
            params.push(status);
        }
        sql += ' ORDER BY data_criacao DESC';
        const { rows } = await db.query(sql, params);
        res.status(200).json(rows);
    } catch (err) {
        console.error('Erro ao buscar ordens de serviço:', err);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// ROTA GET: /ordens-servico/:id (sem alterações)
app.get('/ordens-servico/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const sql = 'SELECT * FROM ordens_servico WHERE id = $1';
        const { rows } = await db.query(sql, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Ordem de Serviço não encontrada.' });
        }
        res.status(200).json(rows[0]);
    } catch (err) {
        console.error(`Erro ao buscar O.S. com id ${id}:`, err);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// ROTA POST: /ordens-servico (sem alterações)
app.post('/ordens-servico', upload.single('foto_defeito'), async (req, res) => {
    const {
        solicitante_nome, solicitante_setor, equipamento_tag,
        localizacao, data_ocorrencia, descricao_problema,
        prioridade, maquina_parada
    } = req.body;
    if (!req.file) {
        return res.status(400).json({ message: 'A foto do defeito é obrigatória.' });
    }
    const caminho_foto = req.file.path;
    const numero_os = `OS-${Date.now()}`;
    try {
        const sql = `
            INSERT INTO ordens_servico (
                numero_os, solicitante_nome, solicitante_setor, equipamento_tag,
                localizacao, data_ocorrencia, descricao_problema, prioridade,
                maquina_parada, caminho_foto
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *;
        `;
        const values = [
            numero_os, solicitante_nome, solicitante_setor, equipamento_tag,
            localizacao, data_ocorrencia, descricao_problema, prioridade,
            maquina_parada === 'sim', caminho_foto
        ];
        const result = await db.query(sql, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao inserir no banco de dados:', err);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// --- NOVA ROTA PARA FINALIZAR UMA O.S. ---
/**
 * ROTA PUT: /ordens-servico/:id/finalizar
 * Atualiza uma O.S. para o status 'Finalizada' e salva os dados de conclusão.
 * 'PUT' é usado para atualizar um recurso existente.
 */
app.put('/ordens-servico/:id/finalizar', upload.single('foto_reparo'), async (req, res) => {
    const { id } = req.params;
    const { tecnico_responsavel, solucao_aplicada } = req.body;

    if (!req.file || !tecnico_responsavel || !solucao_aplicada) {
        return res.status(400).json({ message: 'Todos os campos de finalização são obrigatórios.' });
    }

    const caminho_foto_reparo = req.file.path;

    try {
        const sql = `
            UPDATE ordens_servico
            SET
                status = 'Finalizada',
                tecnico_responsavel = $1,
                solucao_aplicada = $2,
                caminho_foto_reparo = $3,
                data_conclusao = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING *;
        `;
        const values = [tecnico_responsavel, solucao_aplicada, caminho_foto_reparo, id];
        const result = await db.query(sql, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Ordem de Serviço não encontrada para finalizar.' });
        }

        console.log(`--- O.S. #${result.rows[0].numero_os} FINALIZADA ---`);
        res.status(200).json(result.rows[0]);

    } catch (err) {
        console.error(`Erro ao finalizar a O.S. com id ${id}:`, err);
        res.status(500).json({ message: 'Erro interno do servidor ao finalizar a O.S.' });
    }
});


// --- INICIALIZAÇÃO DO SERVIDOR (sem alterações) ---
app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Servidor rodando e escutando em http://localhost:${port}`);
});
const { Pool } = require('pg');

// Configuração da conexão com o banco de dados PostgreSQL
// Um "Pool" gerencia múltiplas conexões para melhor performance.
const pool = new Pool({
    user: 'postgres', // Usuário padrão do PostgreSQL
    host: 'localhost',
    database: 'manutencao', // Banco de dados padrão
    password: '32356892', // A senha que você definiu na instalação
    port: 5432,
});

// Exporta uma função 'query' para ser usada em outras partes da aplicação
module.exports = {
    query: (text, params) => pool.query(text, params),
};
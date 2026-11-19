-- =====================================================
-- SISTEMA DOS VICENTINOS (SSVP)
-- Banco de Dados: ong_ssvp
-- =====================================================

SET NAMES utf8mb4;

DROP DATABASE IF EXISTS ong_ssvp_teste;

CREATE DATABASE ong_ssvp_teste
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE ong_ssvp_teste;
-- =====================================================
-- 1. TABELA: VOLUNTARIO
-- Cadastro e acesso dos voluntarios
-- =====================================================

CREATE TABLE VOLUNTARIO (
    id_voluntario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    situacao VARCHAR(20) NOT NULL DEFAULT 'ATIVO',

    CONSTRAINT chk_voluntario_situacao
        CHECK (situacao IN ('ATIVO', 'INATIVO'))
);
-- ====================================================
-- 2. TABELA: FAMILIA
-- Cadastro das familias assistidas
-- =====================================================

CREATE TABLE FAMILIA (
    id_familia INT AUTO_INCREMENT PRIMARY KEY,
    nome_responsavel VARCHAR(150) NOT NULL,
    telefone VARCHAR(20),
    cep VARCHAR(10),
    logradouro VARCHAR(150) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado CHAR(2) NOT NULL,
    quantidade_pessoas INT NOT NULL,
    data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    situacao VARCHAR(20) NOT NULL DEFAULT 'ATIVA',

    CONSTRAINT chk_familia_quantidade
        CHECK (quantidade_pessoas > 0),

    CONSTRAINT chk_familia_situacao
        CHECK (situacao IN ('ATIVA', 'INATIVA'))
);
-- =====================================================
-- 3. TABELA: CATEGORIA
-- Classificacao dos produtos
-- =====================================================

CREATE TABLE CATEGORIA (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT
);
-- =====================================================
-- 4. TABELA: ITEM
-- Cadastro dos produtos
-- O saldo sera calculado pelas movimentacoes
-- =====================================================

CREATE TABLE ITEM (
    id_item INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT NOT NULL,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    unidade_medida VARCHAR(20) NOT NULL,

    CONSTRAINT fk_item_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES CATEGORIA(id_categoria)
);
-- =====================================================
-- 5. TABELA: DOACAO
-- Registro das doacoes recebidas
-- =====================================================

CREATE TABLE DOACAO (
    id_doacao INT AUTO_INCREMENT PRIMARY KEY,
    id_voluntario INT NOT NULL,
    data_recebimento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observacao TEXT,

    CONSTRAINT fk_doacao_voluntario
        FOREIGN KEY (id_voluntario)
        REFERENCES VOLUNTARIO(id_voluntario)
);
-- =====================================================
-- 6. TABELA: ITEM_DOACAO
-- Cada registro representa um lote recebido
-- =====================================================

CREATE TABLE ITEM_DOACAO (
    id_item_doacao INT AUTO_INCREMENT PRIMARY KEY,
    id_doacao INT NOT NULL,
    id_item INT NOT NULL,
    quantidade DECIMAL(10,3) NOT NULL,
    data_validade DATE,

    CONSTRAINT fk_itemdoacao_doacao
        FOREIGN KEY (id_doacao)
        REFERENCES DOACAO(id_doacao),

    CONSTRAINT fk_itemdoacao_item
        FOREIGN KEY (id_item)
        REFERENCES ITEM(id_item),

    CONSTRAINT chk_itemdoacao_quantidade
        CHECK (quantidade > 0)
);
-- =====================================================
-- 7. TABELA: ASSISTENCIA
-- Registro dos atendimentos realizados
-- =====================================================

CREATE TABLE ASSISTENCIA (
    id_assistencia INT AUTO_INCREMENT PRIMARY KEY,
    id_familia INT,
    id_voluntario INT NOT NULL,
    data_atendimento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tipo_assistencia VARCHAR(60) NOT NULL,
    identificacao_destinatario VARCHAR(150),
    descricao TEXT,

    CONSTRAINT fk_assistencia_familia
        FOREIGN KEY (id_familia)
        REFERENCES FAMILIA(id_familia),

    CONSTRAINT fk_assistencia_voluntario
        FOREIGN KEY (id_voluntario)
        REFERENCES VOLUNTARIO(id_voluntario),

    CONSTRAINT chk_assistencia_tipo
        CHECK (
            tipo_assistencia IN (
                'DOACAO_ALIMENTOS',
                'DOACAO_ROUPAS',
                'PRODUTOS_HIGIENE',
                'ORIENTACAO_SOCIAL',
                'OUTROS'
            )
        ),

    CONSTRAINT chk_assistencia_destinatario
        CHECK (
            id_familia IS NOT NULL
            OR identificacao_destinatario IS NOT NULL
        )
);
-- =====================================================
-- 8. TABELA: MOVIMENTACAO_ESTOQUE
-- Registro das entradas e saidas dos produtos
-- Cada movimentacao referencia um lote especifico
-- =====================================================

CREATE TABLE MOVIMENTACAO_ESTOQUE (
    id_movimentacao INT AUTO_INCREMENT PRIMARY KEY,
    id_item_doacao INT NOT NULL,
    id_voluntario INT NOT NULL,
    id_familia INT,
    tipo_movimentacao VARCHAR(10) NOT NULL,
    quantidade DECIMAL(10,3) NOT NULL,
    data_movimentacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    destino_saida VARCHAR(40),
    finalidade_saida VARCHAR(40),
    identificacao_destinatario VARCHAR(150),
    observacao_saida TEXT,

    CONSTRAINT fk_movimentacao_itemdoacao
        FOREIGN KEY (id_item_doacao)
        REFERENCES ITEM_DOACAO(id_item_doacao),

    CONSTRAINT fk_movimentacao_voluntario
        FOREIGN KEY (id_voluntario)
        REFERENCES VOLUNTARIO(id_voluntario),

    CONSTRAINT fk_movimentacao_familia
        FOREIGN KEY (id_familia)
        REFERENCES FAMILIA(id_familia),

    CONSTRAINT chk_movimentacao_tipo
        CHECK (tipo_movimentacao IN ('ENTRADA', 'SAIDA')),

    CONSTRAINT chk_movimentacao_quantidade
        CHECK (quantidade > 0),

    CONSTRAINT chk_movimentacao_saida
        CHECK (
            (
                tipo_movimentacao = 'ENTRADA'
                AND destino_saida IS NULL
                AND finalidade_saida IS NULL
                AND id_familia IS NULL
                AND identificacao_destinatario IS NULL
                AND observacao_saida IS NULL
            )
            OR
            (
                tipo_movimentacao = 'SAIDA'
                AND destino_saida IS NOT NULL
                AND finalidade_saida IS NOT NULL
                AND (
                    (
                        destino_saida = 'FAMILIA_CADASTRADA'
                        AND id_familia IS NOT NULL
                    )
                    OR
                    (
                        destino_saida = 'PESSOA_NAO_CADASTRADA'
                        AND id_familia IS NULL
                        AND identificacao_destinatario IS NOT NULL
                    )
                    OR
                    (
                        destino_saida = 'OUTRA_DESTINACAO'
                        AND id_familia IS NULL
                    )
                )
            )
        )
);

-- =====================================================
-- 9. GATILHO: ENTRADA AUTOMATICA DO LOTE
-- Ao cadastrar um lote, cria sua entrada no estoque
-- O voluntario responsavel vem do registro da doacao
-- =====================================================

DELIMITER //

CREATE TRIGGER trg_criar_entrada_lote
AFTER INSERT ON ITEM_DOACAO
FOR EACH ROW
BEGIN
    DECLARE v_id_voluntario INT;

    SELECT id_voluntario
    INTO v_id_voluntario
    FROM DOACAO
    WHERE id_doacao = NEW.id_doacao;

    INSERT INTO MOVIMENTACAO_ESTOQUE (
        id_item_doacao,
        id_voluntario,
        tipo_movimentacao,
        quantidade
    )
    VALUES (
        NEW.id_item_doacao,
        v_id_voluntario,
        'ENTRADA',
        NEW.quantidade
    );
END//

-- =====================================================
-- 10. GATILHO: VALIDACAO DAS MOVIMENTACOES
-- Impede uma segunda entrada para o mesmo lote
-- Impede saidas de produtos vencidos
-- Impede saidas superiores ao saldo do lote
-- =====================================================

CREATE TRIGGER trg_validar_movimentacao
BEFORE INSERT ON MOVIMENTACAO_ESTOQUE
FOR EACH ROW
BEGIN
    DECLARE v_data_validade DATE;
    DECLARE v_saldo DECIMAL(10,3);
    DECLARE v_entradas INT;

    IF NEW.tipo_movimentacao = 'ENTRADA' THEN

        SELECT COUNT(*)
        INTO v_entradas
        FROM MOVIMENTACAO_ESTOQUE
        WHERE id_item_doacao = NEW.id_item_doacao
          AND tipo_movimentacao = 'ENTRADA';

        IF v_entradas > 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Este lote ja possui uma entrada inicial.';
        END IF;

    ELSEIF NEW.tipo_movimentacao = 'SAIDA' THEN

        SELECT data_validade
        INTO v_data_validade
        FROM ITEM_DOACAO
        WHERE id_item_doacao = NEW.id_item_doacao;

        IF v_data_validade IS NOT NULL
           AND v_data_validade < CURRENT_DATE() THEN

            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Nao e permitido retirar produtos vencidos.';

        END IF;

        SELECT COALESCE(
            SUM(
                CASE
                    WHEN tipo_movimentacao = 'ENTRADA'
                        THEN quantidade
                    ELSE -quantidade
                END
            ), 0
        )
        INTO v_saldo
        FROM MOVIMENTACAO_ESTOQUE
        WHERE id_item_doacao = NEW.id_item_doacao;

        IF NEW.quantidade > v_saldo THEN

            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Saldo insuficiente neste lote.';

        END IF;

    END IF;
END//

DELIMITER ;


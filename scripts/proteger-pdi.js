#!/usr/bin/env node
'use strict';

/*
 * Protege a página do PDI com senha.
 *
 * Lê pdi.fonte.html (texto aberto, ignorado pelo git), criptografa o
 * conteúdo com a senha informada (PBKDF2 + AES-256-GCM) e gera pdi.html,
 * que é a única versão publicada: uma tela de senha que só mostra a página
 * depois de descriptografá-la no navegador. A senha não é guardada em lugar nenhum.
 *
 * Uso:
 *   node scripts/proteger-pdi.js
 *
 * Opções:
 *   --fonte <arquivo>   arquivo de origem (padrão: pdi.fonte.html)
 *   --saida <arquivo>   arquivo gerado    (padrão: pdi.html)
 * A senha também pode vir da variável de ambiente PDI_SENHA (uso não interativo).
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const RAIZ = path.resolve(__dirname, '..');
const ITERACOES = 600000;
const TAMANHO_MINIMO_SENHA = 10;

function argumento(nome, padrao) {
    const indice = process.argv.indexOf(nome);
    return indice !== -1 && process.argv[indice + 1] ? process.argv[indice + 1] : padrao;
}

function pedirSenha(pergunta) {
    return new Promise(function (resolver) {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
        let mudo = false;
        rl._writeToOutput = function (texto) {
            rl.output.write(mudo ? '*' : texto);
        };
        rl.question(pergunta, function (resposta) {
            rl.close();
            process.stdout.write('\n');
            resolver(resposta);
        });
        mudo = true;
    });
}

async function obterSenha() {
    if (process.env.PDI_SENHA) return process.env.PDI_SENHA;
    if (!process.stdin.isTTY) {
        throw new Error('Execute em um terminal interativo ou defina a variável PDI_SENHA.');
    }
    const senha = await pedirSenha('Senha para a página do PDI: ');
    const confirmacao = await pedirSenha('Repita a senha: ');
    if (senha !== confirmacao) throw new Error('As senhas não conferem.');
    return senha;
}

function cifrar(textoPlano, senha) {
    const sal = crypto.randomBytes(16);
    const iv = crypto.randomBytes(12);
    const chave = crypto.pbkdf2Sync(senha.normalize('NFC'), sal, ITERACOES, 32, 'sha256');
    const cifra = crypto.createCipheriv('aes-256-gcm', chave, iv);
    const cifrado = Buffer.concat([cifra.update(textoPlano, 'utf8'), cifra.final()]);
    // O navegador espera a etiqueta de autenticação ao final dos dados cifrados
    const dados = Buffer.concat([cifrado, cifra.getAuthTag()]);
    return {
        iteracoes: ITERACOES,
        sal: sal.toString('base64'),
        iv: iv.toString('base64'),
        dados: dados.toString('base64')
    };
}

const MODELO = `<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>Acesso restrito | Ana Beatriz Juvencio</title>
    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 1.5rem;
            background: radial-gradient(circle at 20% 10%, #f3e9df 0, transparent 40%), #fbf7f2;
            color: #2b231d;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        main {
            width: min(420px, 100%);
            padding: 2.2rem 2rem;
            border: 1px solid #e8ddd2;
            border-radius: 1.2rem;
            background: #fff;
            box-shadow: 0 18px 50px #5e423222;
            text-align: center;
        }
        .cadeado {
            display: grid;
            width: 3.4rem;
            height: 3.4rem;
            margin: 0 auto 1.1rem;
            place-items: center;
            border-radius: 1rem;
            background: #f3e9df;
            color: #986025;
        }
        h1 { margin: 0 0 0.4rem; font-size: 1.35rem; }
        p { margin: 0 0 1.4rem; color: #6b5f55; font-size: 0.92rem; line-height: 1.55; }
        form { display: grid; gap: 0.8rem; }
        label { position: absolute; left: -9999px; }
        input {
            width: 100%;
            padding: 0.85rem 1rem;
            border: 1px solid #d9cabd;
            border-radius: 0.7rem;
            font: inherit;
            font-size: 1rem;
        }
        input:focus-visible, button:focus-visible { outline: 3px solid #d9a441; outline-offset: 2px; }
        button {
            padding: 0.85rem 1rem;
            border: 0;
            border-radius: 0.7rem;
            background: #745245;
            color: #fff;
            font: inherit;
            font-weight: 700;
            cursor: pointer;
        }
        button:hover { background: #5e4337; }
        button:disabled { opacity: 0.6; cursor: wait; }
        #aviso { min-height: 1.3rem; margin: 0.9rem 0 0; color: #b5584a; font-size: 0.88rem; }
    </style>
</head>

<body>
    <main>
        <div class="cadeado" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="11" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path></svg>
        </div>
        <h1>Acesso restrito</h1>
        <p>Este conteúdo é protegido. Informe a senha para visualizá-lo.</p>
        <form id="form">
            <label for="senha">Senha</label>
            <input id="senha" type="password" placeholder="Senha" autocomplete="current-password" autofocus required>
            <button id="entrar" type="submit">Entrar</button>
        </form>
        <p id="aviso" role="alert" aria-live="polite"></p>
    </main>

    <script id="dados" type="application/json">__DADOS__</script>
    <script>
        (function () {
            var dados = JSON.parse(document.getElementById('dados').textContent);
            var form = document.getElementById('form');
            var campo = document.getElementById('senha');
            var botao = document.getElementById('entrar');
            var aviso = document.getElementById('aviso');
            var CHAVE_SESSAO = 'pdi-acesso';

            function bytes(base64) {
                var texto = atob(base64);
                var saida = new Uint8Array(texto.length);
                for (var i = 0; i < texto.length; i++) saida[i] = texto.charCodeAt(i);
                return saida;
            }

            async function descriptografar(senha) {
                var material = await crypto.subtle.importKey('raw', new TextEncoder().encode(senha.normalize('NFC')), 'PBKDF2', false, ['deriveKey']);
                var chave = await crypto.subtle.deriveKey(
                    { name: 'PBKDF2', salt: bytes(dados.sal), iterations: dados.iteracoes, hash: 'SHA-256' },
                    material,
                    { name: 'AES-GCM', length: 256 },
                    false,
                    ['decrypt']
                );
                var aberto = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes(dados.iv) }, chave, bytes(dados.dados));
                return new TextDecoder().decode(aberto);
            }

            function mostrar(html) {
                document.open();
                document.write(html);
                document.close();
            }

            async function tentar(senha, silencioso) {
                if (!window.crypto || !window.crypto.subtle) {
                    aviso.textContent = 'Este navegador não permite abrir o conteúdo neste endereço. Use uma conexão segura (https).';
                    return;
                }
                botao.disabled = true;
                if (!silencioso) aviso.textContent = 'Verificando...';
                try {
                    var html = await descriptografar(senha);
                    try { sessionStorage.setItem(CHAVE_SESSAO, senha); } catch (erro) { /* sessão indisponível */ }
                    mostrar(html);
                } catch (erro) {
                    try { sessionStorage.removeItem(CHAVE_SESSAO); } catch (erroSessao) { /* sessão indisponível */ }
                    aviso.textContent = silencioso ? '' : 'Senha incorreta. Tente novamente.';
                    botao.disabled = false;
                    if (!silencioso) { campo.select(); }
                }
            }

            form.addEventListener('submit', function (evento) {
                evento.preventDefault();
                tentar(campo.value, false);
            });

            // Dentro da mesma aba, não pede a senha de novo ao recarregar
            try {
                var salva = sessionStorage.getItem(CHAVE_SESSAO);
                if (salva) tentar(salva, true);
            } catch (erro) { /* sessão indisponível */ }
        }());
    </script>
</body>

</html>
`;

async function principal() {
    const fonte = path.resolve(RAIZ, argumento('--fonte', 'pdi.fonte.html'));
    const saida = path.resolve(RAIZ, argumento('--saida', 'pdi.html'));

    if (!fs.existsSync(fonte)) {
        throw new Error('Arquivo de origem não encontrado: ' + fonte);
    }

    const senha = await obterSenha();
    if (senha.length < TAMANHO_MINIMO_SENHA) {
        throw new Error('Use uma senha com pelo menos ' + TAMANHO_MINIMO_SENHA + ' caracteres (de preferência uma frase longa).');
    }

    const html = fs.readFileSync(fonte, 'utf8');
    const pagina = MODELO.replace('__DADOS__', JSON.stringify(cifrar(html, senha)));
    fs.writeFileSync(saida, pagina, 'utf8');

    console.log('Página protegida gerada em: ' + saida);
    console.log('Publique apenas esse arquivo (junto de css/pdi.css e js/pdi.js). A fonte em texto aberto fica fora do git.');
}

principal().catch(function (erro) {
    console.error('Erro: ' + erro.message);
    process.exitCode = 1;
});

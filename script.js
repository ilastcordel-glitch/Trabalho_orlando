// ============================================
// CONFIGURAÇÃO - BANCO DE DADOS COMUNITÁRIO
// ============================================

const DB_COMUNITARIA = {
    // Carregar do localStorage ou iniciar vazio
    denuncias: JSON.parse(localStorage.getItem('denuncias_golpe') || '[]'),
    
    salvar: function() {
        localStorage.setItem('denuncias_golpe', JSON.stringify(this.denuncias));
    },
    
    consultar: function(textoNormalizado) {
        // Verificar se há match com denúncias anteriores
        return this.denuncias.filter(d => {
            const similaridade = calcularSimilaridade(textoNormalizado, d.texto);
            return similaridade > 0.7; // 70% similar
        });
    },
    
    adicionar: function(texto, categoria, risco) {
        this.denuncias.push({
            texto: texto.toLowerCase().slice(0, 200),
            categoria,
            risco,
            data: new Date().toISOString(),
            hash: hashSimples(texto)
        });
        if (this.denuncias.length > 1000) this.denuncias.shift(); // Limite
        this.salvar();
    }
};

// ============================================
// UTILITÁRIOS
// ============================================

function hashSimples(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(16);
}

function calcularSimilaridade(a, b) {
    // Algoritmo de similaridade de cosseno simplificado
    const setA = new Set(a.split(' '));
    const setB = new Set(b.split(' '));
    const intersecao = new Set([...setA].filter(x => setB.has(x)));
    return intersecao.size / Math.sqrt(setA.size * setB.size);
}

function detectarLeetSpeak(texto) {
    // Mapeamento expandido de leet speak
    const leetMap = {
        '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's',
        '7': 't', '@': 'a', '$': 's', '8': 'b', '9': 'g',
        '6': 'g', '+': 't', '(': 'c', ')': 'd', '|': 'i',
        '!': 'i', '?': 'q', '#': 'h', '%': 'x', '&': 'and',
        'vv': 'w', 'rn': 'm', 'tl': 'ti', 'ph': 'f'
    };
    
    let normalizado = texto.toLowerCase();
    for (const [codigo, letra] of Object.entries(leetMap)) {
        const regex = new RegExp(codigo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        normalizado = normalizado.replace(regex, letra);
    }
    return normalizado;
}

function removerAcentos(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function tokenizar(texto) {
    return texto.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(t => t.length > 2);
}

// ============================================
// BIBLIOTECA DE PADRÕES - EXPANDIDA
// ============================================

const BIBLIOTECA_GOLPES = {
    
    // 1. GOLPES FINANCEIROS / PIX
    pix: {
        peso: 50,
        padroes: [
            // Termos diretos
            'pix', 'transferencia', 'transferir', 'receber', 'caiu', 'cair',
            'dinheiro na conta', 'valor disponivel', 'saldo liberado',
            'premio', 'premiado', 'ganhador', 'sorteio', 'concurso',
            'receba agora', 'liberado para saque', 'resgate seu dinheiro',
            'receba pix', 'receber pix', 'transferencia instantanea',
            'caiu pix', 'caiu dinheiro', 'dinheiro extra', 'renda extra',
            'ganhe dinheiro', 'lucro garantido', 'retorno garantido',
            'investimento', 'aplicacao', 'multiplique', 'dobrar valor',
            'triplicar', 'rendimento', 'juros altos', 'juros ao dia',
            
            // Contexto de urgência financeira
            'ultimas vagas', 'vagas limitadas', 'acaba hoje', 'expira em',
            'só hoje', 'ultima chance', 'nao perca', 'corra', 'imediato',
            'liberacao imediata', 'saque imediato', 'disponivel agora',
            
            // Métodos de pagamento suspeitos
            'antecipacao', 'taxa de liberacao', 'taxa de saque',
            'pagamento previo', 'pague para receber', 'custo administrativo',
            'tarifa', 'imposto a pagar', 'taxa de transferencia',
            'pagar para sacar', 'deposito previo', 'garantia de pagamento',
            
            // Golpe do falso comprovante
            'comprovante falso', 'comprovante enviado', 'print do pix',
            'print comprovante', 'fiz o pix', 'ja transferi', 'ja enviei',
            'confirme recebimento', 'verifique sua conta', 'checou o pix',
            
            // Golpe do QR Code
            'escaneie qr code', 'qr code', 'codigo qr', 'leia o codigo',
            'aponte a camera', 'escanear para receber', 'codigo de barras',
            
            // Contas clonadas / sequestradas
            'conta clonada', 'clonaram meu', 'hackearam', 'hackeado',
            'conta bloqueada', 'acesso negado', 'recuperar conta',
            'recuperar acesso', 'desbloquear conta', 'liberar conta'
        ]
    },
    
    // 2. GOLPES ROMÂNTICOS / NAMORO
    romance: {
        peso: 45,
        padroes: [
            'namoro', 'relacionamento', 'encontro', 'conhecer', 'conversar',
            'sou estrangeiro', 'moro fora', 'trabalho no exterior', 'militar',
            'engenheiro', 'medico', 'contrato', 'projeto internacional',
            'preciso de ajuda', 'mandar dinheiro', 'transferir valor',
            'presente de casamento', 'heranca', 'herdeiro', 'processo',
            'advogado', 'documentacao', 'liberar heranca', 'taxa alfandegaria',
            'pacote retido', 'enviei presente', 'surpresa', 'declaracao',
            'amo voce', 'me apaixonei', 'alma gemea', 'destino', 'serio',
            'relacionamento serio', 'casar', 'noivado', 'futuro juntos',
            'preciso confiar', 'prova de amor', 'me ajude a confiar',
            'mande dinheiro', 'emprestimo', 'pague para me ver',
            'passagem de aviao', 'viagem', 'vir te ver', 'encontro pessoal',
            'video chamada', 'nao posso ligar', 'camera quebrada', 'secreto',
            'ninguem pode saber', 'nosso segredo', 'exclusivo', 'privado'
        ]
    },
    
    // 3. GOLPES DE EMPREGO / TRABALHO
    emprego: {
        peso: 40,
        padroes: [
            'vaga de emprego', 'oportunidade de trabalho', 'home office',
            'trabalho em casa', 'renda extra', 'salario', 'ganhos',
            'receba por', 'pago por', 'remuneracao', 'bonus', 'comissao',
            'nao precisa experiencia', 'sem experiencia', 'treinamento pago',
            'curso obrigatorio', 'material de trabalho', 'kit de trabalho',
            'cadastro', 'taxa de cadastro', 'inscricao', 'matricula',
            'pague para trabalhar', 'investimento inicial', 'franquia',
            'marketing multinivel', 'mmn', 'piramide financeira', 'network',
            'prosperidade', 'empreendedor', 'liberdade financeira',
            'seja seu proprio chefe', 'trabalhe pouco', 'ganhe muito',
            'riqueza', 'milionario', 'mudar de vida', 'transformar vida',
            'coach', 'mentoria', 'palestra', 'evento', 'seminario',
            'grupo vip', 'lista vip', 'acesso exclusivo', 'mentoria paga',
            'assinatura', 'mensalidade', 'taxa de plataforma',
            'clicar em anuncios', 'curtir fotos', 'seguir perfis',
            'avaliar produtos', 'testar produtos', 'reembolso',
            'compra com reembolso', 'dinheiro de volta', 'cashback',
            'antecipe valores', 'adicione dinheiro', 'recarregue saldo'
        ]
    },
    
    // 4. GOLPES DE SUPORTE TÉCNICO / FALSA EMPRESA
    suporte: {
        peso: 55,
        padroes: [
            'suporte tecnico', 'atendimento', 'central de atendimento',
            'seu computador', 'seu celular', 'virus detectado', 'ameaca',
            'seguranca comprometida', 'acesso nao autorizado', 'hackeado',
            'sua conta', 'sua senha', 'dados vazados', 'vazamento de dados',
            'atividade suspeita', 'transacao nao reconhecida', 'bloqueio',
            'sua conta sera suspensa', 'cancelamento', 'encerramento',
            'atualizacao obrigatoria', 'confirmar dados', 'validar conta',
            'reverificar', 'atualizar cadastro', 'atualizar dados',
            'microsoft', 'windows', 'apple', 'icloud', 'google', 'gmail',
            'netflix', 'spotify', 'amazon', 'mercado livre', 'correios',
            'receita federal', 'serasa', 'spc', 'banco central', 'bacen',
            'tecnico', 'especialista', 'remoto', 'acesso remoto', 'anydesk',
            'teamviewer', 'ultraviewer', 'instalar programa', 'baixar aplicativo',
            'digite seu cpf', 'digite sua senha', 'digite o codigo',
            'codigo de verificacao', 'token', 'senha de 6 digitos',
            'nao desligue', 'nao feche', 'nao reinicie', 'processo em andamento'
        ]
    },
    
    // 5. GOLPES DE ENTREGA / CORREIOS
    entrega: {
        peso: 45,
        padroes: [
            'correios', 'transportadora', 'entrega', 'pacote', 'encomenda',
            'entrega suspensa', 'entrega retida', 'taxa de entrega',
            'taxa de liberacao', 'despacho alfandegario', 'importacao',
            'produto retido', 'pacote bloqueado', 'entrega falhou',
            'tentativa de entrega', 'redespacho', 'reentrega',
            'pagar taxa', 'pagamento de taxa', 'boleto de entrega',
            'atualizar endereco', 'confirmar endereco', 'endereco incorreto',
            'seu pacote', 'rastreamento', 'codigo de rastreio', 'objeto',
            'entrega expressa', 'sedex', 'pac', 'motoboy', 'frete',
            'valor do frete', 'seguro de entrega', 'valor assegurado'
        ]
    },
    
    // 6. GOLPES DE CHANTAGEM / VINGANÇA
    chantagem: {
        peso: 60,
        padroes: [
            'vazamento', 'vazou', 'vazarei', 'vou vazar', 'expor',
            'fotos intimas', 'video intimo', 'nude', 'pelada', 'pelado',
            'conteudo adulto', 'site adulto', 'cam', 'webcam', 'gravacao',
            'seu dispositivo', 'seu celular', 'sua camera', 'seu microfone',
            'acesso a sua', 'controle remoto', 'gravamos voce', 'flagrante',
            'pagamento em bitcoin', 'btc', 'criptomoeda', 'ransomware',
            'se nao pagar', 'prazo', 'deadline', 'tempo limitado',
            'provas', 'evidencias', 'comprometedor', 'constrangedor',
            'sua familia', 'seus amigos', 'seu trabalho', 'emprego',
            'reputacao', 'destruir', 'acabar com', 'ruinar', 'chantagem',
            'sequestrado', 'sequestro de dados', 'sequestro digital'
        ]
    },
    
    // 7. GOLPES DE DOAÇÃO / CARIDADE FALSA
    caridade: {
        peso: 35,
        padroes: [
            'doacao', 'ajuda humanitaria', 'cancer', 'crianca doente',
            'tratamento', 'cirurgia', 'remedio caro', 'medicamento',
            'ong', 'instituicao de caridade', 'arrecadacao', 'vaquinha',
            'vakinha', 'financiamento coletivo', 'campanha', 'emergencia',
            'desastre', 'enchente', 'incendio', 'terremoto', 'guerra',
            'refugiados', 'familia necessitada', 'morador de rua', 'abandono',
            'preciso de ajuda', 'qualquer valor', 'pix solidario',
            'doacao anonima', 'sem fins lucrativos', 'voluntario'
        ]
    },
    
    // 8. GOLPES DE IMÓVEIS / ALUGUEL
    imoveis: {
        peso: 40,
        padroes: [
            'aluguel', 'alugo', 'apartamento', 'casa', 'imovel', 'kitnet',
            'studio', 'quarto', 'republica', 'dividir aluguel', 'vaga',
            'preco abaixo', 'abaixo do mercado', 'promocao', 'barato',
            'nao precisa fiador', 'sem fiador', 'sem deposito', 'sem caucao',
            'dono viajou', 'moro fora', 'intermediario', 'corretor',
            'sinal', 'adiantamento', 'garantia de locacao', 'seguro fianca',
            'visita virtual', 'nao posso mostrar', 'fotos do imovel',
            'envie o deposito', 'reserve ja', 'vagas limitadas', 'urgente'
        ]
    },
    
    // 9. GOLPES DE COMPRA/VENDA (OLX, Marketplace)
    compravenda: {
        peso: 45,
        padroes: [
            'olx', 'facebook marketplace', 'mercado livre', 'enjoei',
            'compra', 'venda', 'anuncio', 'produto', 'item', 'mercadoria',
            'interesse', 'cliente', 'comprador', 'vendedor', 'pagamento',
            'envio', 'frete gratis', 'entrega gratis', 'nao aceito troca',
            'apenas venda', 'preco fixo', 'negociavel', 'fazemos entrega',
            'motoboy proprio', 'entregamos hoje', 'chega rapido',
            'pagamento antecipado', 'sinal para reservar', 'garanta ja',
            'apenas depósito', 'nao aceito cartao', 'so pix', 'so transferencia',
            'nao posso receber pessoalmente', 'moro longe', 'nao faco entrega',
            'retirada no local', 'endereco falso', 'local inexistente',
            'codigo de rastreio falso', 'rastreio invalido', 'objeto nao entregue',
            'recebi errado', 'produto diferente', 'nao corresponde',
            'golpe do motoboy', 'golpe do falso entregador', 'falso correio'
        ]
    },
    
    // 10. GOLPES DE DOCUMENTOS / IDENTIDADE
    documentos: {
        peso: 50,
        padroes: [
            'cpf', 'rg', 'cnh', 'passaporte', 'titulo de eleitor',
            'comprovante de residencia', 'conta de luz', 'conta de agua',
            'holerite', 'contracheque', 'declaracao de imposto', 'irpf',
            'cadastro positivo', 'cadastro negativo', 'limpar nome',
            'regularizar cpf', 'desbloquear cpf', 'consultar cpf',
            'score', 'aumentar score', 'limpar serasa', 'apagar divida',
            'divida prescrita', 'nao pague', 'ignore cobranca',
            'acordo extrajudicial', 'acordo com desconto', 'quitacao',
            'certidao negativa', 'certidao de nada consta', 'registro',
            'cartorio', 'tabeliao', 'reconhecimento de firma',
            'procuracao', 'mandato', 'assinatura digital', 'certificado digital'
        ]
    },
    
    // 11. GOLPES DE REDES SOCIAIS / PERFIS FALSOS
    redes: {
        peso: 35,
        padroes: [
            'instagram', 'facebook', 'tiktok', 'twitter', 'linkedin',
            'perfil verificado', 'selo azul', 'conta oficial', 'conta verificada',
            'sorteio', 'sorteio oficial', 'promocao', 'brinde', 'presente',
            'seguidores gratis', 'curtidas gratis', 'visualizacoes gratis',
            'hackear instagram', 'recuperar conta', 'clonar perfil',
            'perfil clonado', 'falsificado', 'impersonacao', 'fake',
            'verificacao em duas etapas', '2fa', 'codigo de backup',
            'senha temporaria', 'acesso negado', 'suspensao de conta',
            'violacao de direitos', 'denuncia', 'reportar', 'bloqueio',
            'recuperar acesso', 'suporte instagram', 'central facebook'
        ]
    },
    
    // 12. GOLPES DE SAÚDE / REMÉDIOS MILAGRE
    saude: {
        peso: 45,
        padroes: [
            'emagrecer', 'perder peso', 'detox', 'secar', 'queima gordura',
            'metabolismo acelerado', 'remedio natural', 'fitoterapico',
            'suplemento', 'vitamina', 'colageno', 'omega', 'probiotico',
            'tratamento milagroso', 'cura', 'curou meu cancer', 'cura diabetes',
            'reverte alzheimer', 'cura impotencia', 'aumenta desempenho',
            'testosterona', 'hormonio', 'anabolizante', 'sarms', 'peptideo',
            'sem efeitos colaterais', '100% natural', 'aprovado pela anvisa',
            'registro ms', 'laboratorio', 'formula secreta', 'receita caseira',
            'chá', 'suco', 'diet', 'light', 'zero acucar', 'zero carboidrato',
            'antes e depois', 'resultados reais', 'depoimento', 'transformacao',
            'barriga chapada', 'definicao muscular', 'massa magra',
            'apenas hoje', 'desconto exclusivo', 'ultimas unidades'
        ]
    },
    
    // 13. GOLPES DE INVESTIMENTOS / CRIPTOMOEDAS
    cripto: {
        peso: 55,
        padroes: [
            'bitcoin', 'ethereum', 'criptomoeda', 'crypto', 'btc', 'eth',
            'binance', 'coinbase', 'wallet', 'carteira digital', 'blockchain',
            'mineracao', 'minerar', 'rig de mineracao', 'fazenda de bitcoin',
            'lucro diario', 'rendimento diario', 'porcentagem ao dia',
            'trading', 'day trade', 'swing trade', 'scalper', 'robo trader',
            'sinais de trading', 'grupo vip', 'mentoria trading', 'curso',
            'aprenda a operar', 'ganhe operando', 'operacoes garantidas',
            'nao tem risco', 'risco zero', 'garantia de lucro',
            'piramide financeira', 'esquema ponzi', 'multinivel',
            'indique e ganhe', 'bonus por indicacao', 'rede de indicados',
            'nivel', 'up line', 'down line', 'matriz', 'ciclo',
            'airdrop', 'token gratis', 'moeda gratis', 'distribuicao',
            'ico', 'ido', 'launchpad', 'preventa', 'whitelist',
            'contrato inteligente', 'smart contract', 'defi', 'nft',
            'metaverso', 'play to earn', 'move to earn', 'gamefi'
        ]
    },
    
    // 14. URGÊNCIA E PRESSÃO PSICOLÓGICA
    urgencia: {
        peso: 25,
        padroes: [
            'urgente', 'imediato', 'agora', 'ja', 'rapido', 'corra',
            'nao perca', 'ultima chance', 'acaba hoje', 'acaba agora',
            'termina em', 'expira em', 'valido ate', 'prazo', 'deadline',
            'vagas limitadas', 'ultimas vagas', 'somente hoje', 'so hoje',
            'exclusivo', 'unica chance', 'nao vai se arrepender',
            'todo mundo ta fazendo', 'viralizou', 'bombou', 'explodiu',
            'corre', 'aproveite', 'garanta ja', 'reserve ja', 'compre ja',
            'clique agora', 'acesse agora', 'ligue agora', 'mande agora',
            'tempo esgotando', 'contagem regressiva', 'cronometro',
            'promocao relampago', 'black friday', 'cyber monday',
            'oferta imperdivel', 'preco de custo', 'abaixo do preco',
            'queima de estoque', 'liquidacao', 'encerramento de loja'
        ]
    },
    
    // 15. COMUNICAÇÃO SUSPEITA
    comunicacao: {
        peso: 20,
        padroes: [
            'chama no zap', 'chama no privado', 'me chama', 'manda mensagem',
            'nao posso falar aqui', 'conversa privada', 'chat privado',
            'nao e seguro', 'alguem esta vendo', 'alguem pode ver',
            'apague essa mensagem', 'nao compartilhe', 'segredo',
            'confidencial', 'reservado', 'exclusivo', 'vip', 'selecao',
            'grupo fechado', 'grupo secreto', 'comunidade exclusiva',
            'link direto', 'link privado', 'acesso restrito', 'senha',
            'codigo de acesso', 'convite', 'indicacao', 'indicado',
            'so entra quem eu chamar', 'selecao manual', 'triagem'
        ]
    }
};

// ============================================
// PADRÕES DE FRASES CONTEXTUAIS (COMBINAÇÕES)
// ============================================

const PADROES_COMBINADOS = [
    {
        nome: "Golpe do PIX + Urgência",
        combinacao: ['pix', 'urgente'],
        pesoBonus: 30
    },
    {
        nome: "Romance + Pedido de Dinheiro",
        combinacao: ['amo', 'dinheiro', 'ajuda'],
        pesoBonus: 40
    },
    {
        nome: "Emprego + Pagamento Prévio",
        combinacao: ['emprego', 'pague', 'cadastro'],
        pesoBonus: 45
    },
    {
        nome: "Suporte + Acesso Remoto",
        combinacao: ['suporte', 'remoto', 'acesso'],
        pesoBonus: 50
    },
    {
        nome: "Entrega + Taxa Suspeita",
        combinacao: ['entrega', 'taxa', 'pagar'],
        pesoBonus: 35
    },
    {
        nome: "Chantagem + Cripto",
        combinacao: ['vazar', 'bitcoin', 'pagar'],
        pesoBonus: 55
    },
    {
        nome: "Link + Banco",
        combinacao: ['http', 'banco', 'senha'],
        pesoBonus: 60
    },
    {
        nome: "Promessa Irreal + Dinheiro Fácil",
        combinacao: ['garantido', 'dinheiro', 'facil'],
        pesoBonus: 35
    },
    {
        nome: "Privado + Urgência",
        combinacao: ['privado', 'urgente', 'agora'],
        pesoBonus: 25
    }
];

// ============================================
// ANÁLISE DE URL AVANÇADA
// ============================================

const ANALISE_URL = {
    // TLDs de alto risco
    tldsSuspeitos: ['.xyz', '.top', '.click', '.link', '.work', '.date', 
                    '.download', '.racing', '.win', '.bid', '.party', '.trade',
                    '.science', '.gdn', '.men', '.loan', '.click', '.ooo',
                    '.bar', '.cam', '.casa', '.cyou', '.fit', '.icu', '.life',
                    '.live', '.ml', '.cf', '.ga', '.gq', '.tk'],
    
    // Marcas comumente falsificadas
    marcasAlvo: [
        { nome: 'nubank', variacoes: ['nubanq', 'nubenk', 'nub4nk', 'nu-bank', 'nubankk'] },
        { nome: 'itau', variacoes: ['1tau', 'it4u', 'itauu', '1taú', 'itau-bank'] },
        { nome: 'bradesco', variacoes: ['bradescco', 'bradesc0', 'bradesco-digital'] },
        { nome: 'santander', variacoes: ['sant4nder', 'santandeer', 'santander-brasil'] },
        { nome: 'caixa', variacoes: ['caixaa', 'ca1xa', 'caixa-economica'] },
        { nome: 'bancodobrasil', variacoes: ['bb', 'banco-brasil', 'bancodobrasil'] },
        { nome: 'mercadolivre', variacoes: ['mercado-livre', 'mercadolivre-br', 'mercadolibre'] },
        { nome: 'correios', variacoes: ['correio', 'correios-br', 'correios-rastreio'] },
        { nome: 'netflix', variacoes: ['netfl1x', 'netflix-br', 'netflix-atualizar'] },
        { nome: 'instagram', variacoes: ['instagran', 'insta-verify', 'instagram-verify'] },
        { nome: 'whatsapp', variacoes: ['whatsap', 'whats-app', 'whatsapp-web'] },
        { nome: 'telegram', variacoes: ['telegran', 'telegram-web', 'telegram-verify'] }
    ],
    
    // Encurtadores
    encurtadores: ['bit.ly', 'tinyurl.com', 'short.link', 'cutt.ly', 'is.gd',
                   't.co', 'goo.gl', 'ow.ly', 'rebrand.ly', 'shorturl.at'],
    
    analisar: function(url) {
        let risco = 0;
        const sinais = [];
        const urlLower = url.toLowerCase();
        
        // Verificar TLD suspeito
        this.tldsSuspeitos.forEach(tld => {
            if (urlLower.endsWith(tld) || urlLower.includes(tld + '/')) {
                risco += 30;
                sinais.push(`TLD de alto risco: ${tld}`);
            }
        });
        
        // Verificar imitação de marcas
        this.marcasAlvo.forEach(marca => {
            const todasVariacoes = [marca.nome, ...marca.variacoes];
            todasVariacoes.forEach(variacao => {
                if (urlLower.includes(variacao) && !urlLower.includes(variacao + '.com.br')) {
                    // Verificar se é domínio oficial ou similar
                    const partes = urlLower.split('/');
                    const dominio = partes[2] || '';
                    
                    // Se contém a marca mas não é o domínio oficial
                    if (dominio.includes(variacao) && 
                        !dominio.endsWith(`${marca.nome}.com.br`) &&
                        !dominio.endsWith(`${marca.nome}.com`)) {
                        risco += 50;
                        sinais.push(`Possível phishing: imitação ${marca.nome}`);
                    }
                }
            });
        });
        
        // Verificar encurtadores
        this.encurtadores.forEach(enc => {
            if (urlLower.includes(enc)) {
                risco += 25;
                sinais.push(`URL encurtada (oculta destino): ${enc}`);
            }
        });
        
        // Verificar HTTPS falso ou ausente
        if (urlLower.startsWith('http:')) {
            risco += 15;
            sinais.push('Conexão não segura (HTTP sem S)');
        }
        
        // Verificar caracteres homógrafos no domínio
        const dominio = urlLower.match(/https?:\/\/([^\/]+)/)?.[1] || '';
        const caracteresSuspeitos = /[а-яА-Яα-ωΑ-Ω]/; // Cirílico e grego
        if (caracteresSuspeitos.test(dominio)) {
            risco += 60;
            sinais.push('🚨 HOMÓGRAFO DETECTADO: caracteres cirílicos no domínio');
        }
        
        // Verificar subdomínios suspeitos
        const subdominios = (dominio.match(/\./g) || []).length;
        if (subdominios > 3) {
            risco += 20;
            sinais.push('Múltiplos subdomínios (tática de confusão)');
        }
        
        // Verificar números no domínio (comum em golpes)
        const numerosNoDominio = dominio.replace(/[^\d]/g, '').length;
        if (numerosNoDominio > 4) {
            risco += 15;
            sinais.push('Excesso de números no domínio');
        }
        
        return { risco, sinais };
    }
};

// ============================================
// FUNÇÃO PRINCIPAL DE ANÁLISE
// ============================================

function analisarTextoAvancado(textoOriginal) {
    if (!textoOriginal || !textoOriginal.trim()) {
        return { risco: 0, sinais: [], categoria: 'vazio' };
    }
    
    const original = textoOriginal;
    let riscoTotal = 0;
    const sinaisDetectados = [];
    const categoriasDetectadas = [];
    
    // ===== NORMALIZAÇÃO MULTI-CAMADA =====
    let textoNormalizado = original.toLowerCase();
    
    // Camada 1: Remover acentos
    textoNormalizado = removerAcentos(textoNormalizado);
    
    // Camada 2: Converter leet speak
    textoNormalizado = detectarLeetSpeak(textoNormalizado);
    
    // Camada 3: Separar caracteres colados
    textoNormalizado = textoNormalizado
        .replace(/([a-z])([0-9])/g, '$1 $2')
        .replace(/([0-9])([a-z])/g, '$1 $2');
    
    // Camada 4: Normalizar espaços e pontuação
    textoNormalizado = textoNormalizado
        .replace(/[._\-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    
    // ===== ANÁLISE DE CATEGORIAS =====
    for (const [categoria, dados] of Object.entries(BIBLIOTECA_GOLPES)) {
        let matches = 0;
        const padroesEncontrados = [];
        
        for (const padrao of dados.padroes) {
            // Busca exata de palavra
            const regex = new RegExp(`\\b${padrao}\\b`, 'i');
            const regexParcial = new RegExp(padrao, 'i');
            
            if (regex.test(textoNormalizado) || regexParcial.test(textoNormalizado)) {
                matches++;
                padroesEncontrados.push(padrao);
            }
        }
        
        if (matches > 0) {
            // Peso aumenta com quantidade de matches (efeito cumulativo)
            const pesoCategoria = dados.peso * Math.min(matches, 3);
            riscoTotal += pesoCategoria;
            categoriasDetectadas.push(categoria);
            
            // Adicionar sinais (limitar para não poluir)
            if (matches <= 3) {
                sinaisDetectados.push(`⚠️ ${categoria.toUpperCase()}: ${padroesEncontrados.slice(0, 2).join(', ')}`);
            } else {
                sinaisDetectados.push(`⚠️ ${categoria.toUpperCase()}: ${matches} indicadores encontrados`);
            }
        }
    }
    
    // ===== ANÁLISE DE COMBINAÇÕES PERIGOSAS =====
    for (const padrao of PADROES_COMBINADOS) {
        const todosPresentes = padrao.combinacao.every(termo => 
            textoNormalizado.includes(termo)
        );
        
        if (todosPresentes) {
            riscoTotal += padrao.pesoBonus;
            sinaisDetectados.push(`🚨 COMBINAÇÃO CRÍTICA: ${padrao.nome} (+${padrao.pesoBonus})`);
        }
    }
    
    // ===== ANÁLISE DE URLS =====
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.(com|net|org|br|xyz|top|click|shop|site|online|info)[^\s]*)/gi;
    const urlsEncontradas = original.match(urlRegex) || [];
    
    urlsEncontradas.forEach(url => {
        const analise = ANALISE_URL.analisar(url);
        riscoTotal += analise.risco;
        sinaisDetectados.push(...analise.sinais);
    });
    
    // URLs malformadas (tentativa de bypass)
    const urlMalformada = /https?[;:,]\/\/|h\s*t\s*t\s*p|w\s*w\s*w/;
    if (urlMalformada.test(original)) {
        riscoTotal += 40;
        sinaisDetectados.push('⚠️ URL malformada (tentativa de ocultação)');
    }
    
    // ===== ANÁLISE DE NÚMEROS =====
    const numeros = original.match(/\d+/g) || [];
    
    // Números de telefone suspeitos
    const telefones = original.match(/(\(?\d{2}\)?\s?\d{4,5}[-.]?\d{4})|(\d{11,})/g) || [];
    if (telefones.length > 0) {
        riscoTotal += 15;
        sinaisDetectados.push(`📞 ${telefones.length} número(s) de telefone detectado(s)`);
    }
    
    // Números de conta/pix
    const chavesPix = original.match(/(cpf|cnpj|email|telefone):\s*\d+/gi) || [];
    if (chavesPix.length > 0) {
        riscoTotal += 20;
        sinaisDetectados.push('💳 Solicitação de dados PIX detectada');
    }
    
    // ===== ANÁLISE LINGUÍSTICA =====
    
    // Urgência excessiva (maiúsculas)
    const caps = (original.match(/[A-Z]/g) || []).length;
    const ratioCaps = caps / original.length;
    if (ratioCaps > 0.3) {
        riscoTotal += 15;
        sinaisDetectados.push('🔤 Texto em maiúsculas excessivo (gritos/urgência)');
    }
    
    // Exclamações excessivas
    const exclamacoes = (original.match(/!/g) || []).length;
    if (exclamacoes > 5) {
        riscoTotal += 10;
        sinaisDetectados.push(`❗ Urgência artificial (${exclamacoes} exclamações)`);
    }
    
    // Interrogações excessivas
    const interrogacoes = (original.match(/\?/g) || []).length;
    if (interrogacoes > 4) {
        riscoTotal += 8;
        sinaisDetectados.push('❓ Pressão psicológica (muitas interrogações)');
    }
    
    // Emojis excessivos
    const emojis = (original.match(/[\u{1F300}-\u{1FAFF}]/gu) || []).length;
    if (emojis > 5) {
        riscoTotal += 10;
        sinaisDetectados.push(`😀 Excesso de emojis (${emojis}) - tentativa de parecer amigável`);
    }
    
    // Repetição de caracteres (gritos)
    const repeticao = original.match(/(.)\1{4,}/g);
    if (repeticao) {
        riscoTotal += 12;
        sinaisDetectados.push('〰️ Repetição excessiva de caracteres');
    }
    
    // Caracteres especiais suspeitos
    const especiais = (original.match(/[@#$%&*+\/\\|]/g) || []).length;
    if (especiais > 10) {
        riscoTotal += 10;
        sinaisDetectados.push('✴️ Uso excessivo de caracteres especiais');
    }
    
    // ===== CONSULTA COMUNITÁRIA =====
    const denunciasSimilares = DB_COMUNITARIA.consultar(textoNormalizado);
    if (denunciasSimilares.length > 0) {
        const riscoComunitario = Math.min(denunciasSimilares.length * 15, 40);
        riscoTotal += riscoComunitario;
        sinaisDetectados.push(`👥 ${denunciasSimilares.length} denúncia(s) similar(es) na base comunitária`);
    }
    
    // ===== ANÁLISE DE SENTIMENTO / MANIPULAÇÃO =====
    
    // Detectar ameaça velada
    const ameacas = ['se nao', 'caso contrario', 'ou entao', 'vou ter que', 'sera necessario'];
    ameacas.forEach(ameaca => {
        if (textoNormalizado.includes(ameaca)) {
            riscoTotal += 15;
            sinaisDetectados.push('⚠️ Linguagem de ameaça/pressão detectada');
        }
    });
    
    // Detectar falsidade de escassez
    const escassez = ['ultimas unidades', 'so restam', 'acabando', 'esgotando'];
    escassez.forEach(termo => {
        if (textoNormalizado.includes(termo)) {
            riscoTotal += 10;
            sinaisDetectados.push('⏰ Falsa escassez (tática de vendas agressiva)');
        }
    });
    
    // ===== CÁLCULO FINAL =====
    riscoTotal = Math.min(100, Math.round(riscoTotal));
    
    // Determinar categoria principal
    let categoriaPrincipal = 'neutro';
    if (categoriasDetectadas.length > 0) {
        // Priorizar categorias mais graves
        const prioridade = ['chantagem', 'cripto', 'suporte', 'pix', 'romance'];
        categoriaPrincipal = categoriasDetectadas.find(c => prioridade.includes(c)) || 
                            categoriasDetectadas[0];
    }
    
    return {
        risco: riscoTotal,
        sinais: sinaisDetectados,
        categoria: categoriaPrincipal,
        categorias: categoriasDetectadas,
        urls: urlsEncontradas,
        textoNormalizado: textoNormalizado
    };
}

// ============================================
// INTERFACE COM O DOM
// ============================================

function inicializarDetector() {
    const button = document.getElementById("scanButton");
    const input = document.getElementById("inputText");
    
    if (!button || !input) {
        console.error('Elementos não encontrados');
        return;
    }
    
    button.addEventListener("click", () => {
        const texto = input.value;
        const resultado = analisarTextoAvancado(texto);
        exibirResultado(resultado);
        
        // Opcional: salvar análise na base comunitária se risco for alto
        if (resultado.risco > 70) {
            DB_COMUNITARIA.adicionar(texto, resultado.categoria, resultado.risco);
        }
    });
    
    // Análise em tempo real (opcional)
    let timeout;
    input.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const texto = input.value;
            if (texto.length > 20) {
                const resultado = analisarTextoAvancado(texto);
                exibirResultado(resultado, true); // true = preview
            }
        }, 500);
    });
}

function exibirResultado(resultado, isPreview = false) {
    const riskLevel = document.getElementById("riskLevel");
    const riskFill = document.getElementById("riskFill");
    const details = document.getElementById("details");
    
    if (!riskLevel || !riskFill || !details) return;
    
    // Animação da barra
    riskFill.style.width = resultado.risco + "%";
    riskFill.style.transition = 'width 0.5s ease';
    
    // Cor e texto baseado no risco
    let cor, texto, icone;
    
    if (resultado.risco < 25) {
        cor = "#22c55e";
        texto = "🟢 Baixo risco";
        icone = "✅";
    } else if (resultado.risco < 50) {
        cor = "#eab308";
        texto = "🟡 Suspeito";
        icone = "⚠️";
    } else if (resultado.risco < 75) {
        cor = "#f97316";
        texto = "🟠 Alto risco";
        icone = "🚨";
    } else {
        cor = "#dc2626";
        texto = "🔴 GOLPE CONFIRMADO";
        icone = "⛔";
    }
    
    riskFill.style.background = cor;
    riskLevel.innerHTML = `${icone} ${texto} (${resultado.risco}%)`;
    riskLevel.style.color = cor;
    
    // Montar detalhes
    let html = '';
    
    if (resultado.categorias.length > 0) {
        html += `<div style="margin-bottom: 10px; font-weight: bold;">Categorias: ${resultado.categorias.join(', ')}</div>`;
    }
    
    if (resultado.sinais.length > 0) {
        html += '<ul style="margin: 0; padding-left: 20px;">';
        resultado.sinais.forEach(sinal => {
            html += `<li style="margin: 5px 0;">${sinal}</li>`;
        });
        html += '</ul>';
    } else {
        html = '<p>Nenhum sinal suspeito detectado.</p>';
    }
    
    // Dicas específicas baseadas na categoria
    if (resultado.categoria && resultado.categoria !== 'neutro') {
        html += `<div style="margin-top: 15px; padding: 10px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
            <strong>💡 Dica:</strong> ${getDica(resultado.categoria)}
        </div>`;
    }
    
    // Botão de denúncia
    if (resultado.risco > 50 && !isPreview) {
        html += `<div style="margin-top: 15px;">
            <button onclick="denunciar('${hashSimples(resultado.textoNormalizado)}')" 
                    style="background: #dc2626; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                🚩 Denunciar este golpe
            </button>
        </div>`;
    }
    
    details.innerHTML = html;
}

function getDica(categoria) {
    const dicas = {
        pix: "Nunca faça PIX para desconhecidos. Verifique sempre a chave antes de confirmar.",
        romance: "Desconfie de relacionamentos online que pedem dinheiro. Nunca envie valores.",
        emprego: "Emprego legítimo NUNCA exige pagamento prévio. Desconfie de 'oportunidades' milagrosas.",
        suporte: "Empresas NUNCA ligam dizendo que seu computador tem vírus. Desligue imediatamente.",
        entrega: "Correios NUNCA cobram taxa via WhatsApp. Verifique no site oficial.",
        chantagem: "Não pague chantagens digitais. Procure a polícia e denuncie.",
        caridade: "Verifique a legitimidade da ONG antes de doar. Golpistas exploram tragédias.",
        imoveis: "Nunca transfira dinheiro sem visitar o imóvel e verificar a documentação.",
        compravenda: "Desconfie de preços muito abaixo do mercado. Use plataformas com proteção ao consumidor.",
        documentos: "Nunca envie fotos de documentos para desconhecidos. Dados podem ser usados em fraudes.",
        redes: "Verifique o @ oficial antes de interagir. Golpistas criam perfis quase idênticos.",
        saude: "Remédios milagrosos não existem. Consulte sempre um médico.",
        cripto: "Promessas de lucro garantido em cripto são golpes. Nunca invista sem pesquisar.",
        urgencia: "A urgência artificial é uma tática de pressão. Respire e verifique antes de agir.",
        comunicacao: "Conversas que precisam ser 'secretas' são suspeitas. Legitimidade não se esconde."
    };
    return dicas[categoria] || "Sempre desconfie de promessas boas demais para ser verdade.";
}

function denunciar(hash) {
    alert('Obrigado por denunciar! Sua denúncia ajuda a proteger outros usuários.');
    // Aqui você poderia enviar para um servidor real
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarDetector);
} else {
    inicializarDetector();
}
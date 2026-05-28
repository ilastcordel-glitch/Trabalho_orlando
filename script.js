const button = document.getElementById("scanButton");

button.addEventListener("click", analisarTexto);

function analisarTexto() {

    const originalText =
        document.getElementById("inputText").value;

    if (!originalText || !originalText.trim()) return;

    const lower = originalText.toLowerCase();

    let risco = 0;
    let sinais = new Set();

    // =========================
    // NORMALIZAÇÃO ANTI-BYPASS
    // =========================

    const texto = lower
        .replace(/0/g, "o")
        .replace(/1/g, "i")
        .replace(/3/g, "e")
        .replace(/4/g, "a")
        .replace(/5/g, "s")
        .replace(/7/g, "t")
        .replace(/@/g, "a")
        .replace(/\$/g, "s")
        .replace(/[._\-\s]+/g, " ");

    // =========================
    // DETECÇÃO EXPLÍCITA DE GOLPE
    // =========================

    const golpeExplicito = [
        { k: "golpe", w: 60 },
        { k: "fraude", w: 55 },
        { k: "phishing", w: 60 },
        { k: "scam", w: 50 },
        { k: "roubo", w: 40 }
    ];

    golpeExplicito.forEach(p => {
        if (texto.includes(p.k)) {
            risco += p.w;
            sinais.add(`⚠ Termo crítico: ${p.k}`);
        }
    });

    // =========================
    // CONTEXTO SOCIAL (WHATSAPP / TELEGRAM)
    // =========================

    const social = [
        "whatsapp", "telegram", "instagram", "dm",
        "me chama no zap", "chama no privado",
        "manda no privado", "conversa privada",
        "link na bio", "me chama no whatsapp",
        "me chama no telegram"
    ];

    social.forEach(p => {
        if (texto.includes(p)) {
            risco += 12;
            sinais.add(`⚠ Contexto social: ${p}`);
        }
    });

    // =========================
    // GOLPES SEXUAIS / CHANTAGEM
    // =========================

    const sexual = [
        "nudes", "foto pelada", "vídeo íntimo",
        "vazado", "vazaram suas fotos",
        "vou te expor", "te expor",
        "print seu", "vou postar"
    ];

    sexual.forEach(p => {
        if (texto.includes(p)) {
            risco += 25;
            sinais.add(`🚨 Possível chantagem: ${p}`);
        }
    });

    // =========================
    // GÍRIAS / GOLPES COMUNS BR
    // =========================

    const girias = [
        "pix caiu", "pix premiado",
        "dinheiro fácil", "renda extra",
        "lucro garantido", "sem esforço",
        "trampo online", "trabalho fácil",
        "ganho rápido", "hackeado"
    ];

    girias.forEach(p => {
        if (texto.includes(p)) {
            risco += 15;
            sinais.add(`⚠ Linguagem de golpe: ${p}`);
        }
    });

    // =========================
    // LINKS
    // =========================

    const regexURL =
        /((https?:\/\/)?([a-z0-9-]+\.)+(com|net|org|xyz|top|click|shop|ru|cn|online|site|info)(\/\S*)?)/gi;

    const urls = originalText.match(regexURL);

    if (urls && urls.length > 0) {
        risco += 40;
        sinais.add("⚠ Link ou domínio detectado");
    }

    // =========================
    // LINKS MAL FORMADOS
    // =========================

    const urlQuebrada =
        /(https?[;:,]\/\/|http[s]?:\/\/\s|www\.|https?:\/\/\s|https?:\/\/;)/gi;

    if (urlQuebrada.test(originalText)) {
        risco += 35;
        sinais.add("⚠ URL malformada (bypass)");
    }

    // =========================
    // ENCURTADORES
    // =========================

    const encurtadores = [
        "bit.ly", "tinyurl", "cutt.ly",
        "goo.gl", "t.co", "shorturl"
    ];

    encurtadores.forEach(e => {
        if (texto.includes(e)) {
            risco += 30;
            sinais.add(`⚠ Encurtador: ${e}`);
        }
    });

    // =========================
    // DOMÍNIOS SUSPEITOS
    // =========================

    const tldsRuins = [
        ".xyz", ".top", ".click", ".monster",
        ".gq", ".ru", ".cn"
    ];

    tldsRuins.forEach(tld => {
        if (texto.includes(tld)) {
            risco += 25;
            sinais.add(`⚠ Domínio suspeito: ${tld}`);
        }
    });

    // =========================
    // IMITAÇÃO DE BANCOS
    // =========================

    const bancos = [
        "nubank", "itau", "bradesco",
        "caixa", "santander", "paypal"
    ];

    bancos.forEach(banco => {
        if (
            texto.includes(banco + "-") ||
            texto.includes(banco + "_") ||
            texto.includes(banco + ".") ||
            texto.includes(banco + "seguranca")
        ) {
            risco += 45;
            sinais.add(`⚠ Imitação de banco: ${banco}`);
        }
    });

    // =========================
    // GOLPE + LINK (CRÍTICO)
    // =========================

    if (texto.includes("golpe") && urls) {
        risco += 70;
        sinais.add("🚨 Golpe explícito com link");
    }

    // =========================
    // MAIÚSCULAS
    // =========================

    const caps =
        (originalText.match(/[A-Z]/g) || []).length;

    if (caps > originalText.length * 0.4) {
        risco += 15;
        sinais.add("⚠ Uso excessivo de maiúsculas");
    }

    // =========================
    // EXCLAMAÇÕES
    // =========================

    const excl = (originalText.match(/!/g) || []).length;

    if (excl > 5) {
        risco += 10;
        sinais.add("⚠ Excesso de exclamações");
    }

    // =========================
    // EMOJIS
    // =========================

    const emojis =
        (originalText.match(/[\u{1F300}-\u{1FAFF}]/gu) || []).length;

    if (emojis > 6) {
        risco += 10;
        sinais.add("⚠ Muitos emojis");
    }

    // =========================
    // HOMÓGRAFOS
    // =========================

    if (/[а-яΑ-Ω]/i.test(originalText)) {
        risco += 40;
        sinais.add("⚠ Caracteres suspeitos (homógrafo)");
    }

    // =========================
    // REPETIÇÃO
    // =========================

    if (/(.)\1{6,}/.test(originalText)) {
        risco += 15;
        sinais.add("⚠ Repetição suspeita");
    }

    // =========================
    // SCORE FINAL
    // =========================

    risco = Math.min(100, Math.round(risco));

    mostrarResultado(risco, Array.from(sinais));
}

function mostrarResultado(risco, sinais) {

    const riskLevel =
        document.getElementById("riskLevel");

    const riskFill =
        document.getElementById("riskFill");

    const details =
        document.getElementById("details");

    riskFill.style.width = risco + "%";

    if (risco < 30) {
        riskLevel.innerHTML = "🟢 Baixo risco";
        riskFill.style.background = "#00ff99";
    }

    else if (risco < 70) {
        riskLevel.innerHTML = "🟡 Mensagem suspeita";
        riskFill.style.background = "#ffd500";
    }

    else {
        riskLevel.innerHTML = "🔴 Alto risco de golpe";
        riskFill.style.background = "#ff3b3b";
    }

    details.innerHTML =
        sinais.length ? sinais.join("<br>") : "Nenhum sinal suspeito detectado.";
}
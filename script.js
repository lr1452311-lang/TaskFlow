
// ==============================
// CARREGAMENTO DAS TAREFAS
// ==============================

let tarefas = [];

try {
    tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];

    if (!Array.isArray(tarefas)) {
        tarefas = [];
    }
} catch (erro) {
    tarefas = [];
}

const titulo = document.getElementById("titulo");
const descricao = document.getElementById("descricao");
const prioridade = document.getElementById("prioridade");
const prazo = document.getElementById("prazo");
const botaoAdicionar = document.getElementById("adicionar");

const pesquisa = document.getElementById("pesquisa");
const filtroPrioridade = document.getElementById("filtroPrioridade");
const filtroStatus = document.getElementById("filtroStatus");

const colunas = document.querySelectorAll(".coluna");

// ==============================
// SALVAR NO LOCALSTORAGE
// ==============================

function salvar() {
    localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

// ==============================
// ADICIONAR TAREFA
// ==============================

function adicionarTarefa() {
    const nome = titulo.value.trim();

    if (!nome) {
        alert("Digite o título da tarefa!");
        titulo.focus();
        return;
    }

    tarefas.push({
        id: Date.now(),
        titulo: nome,
        descricao: descricao.value.trim(),
        prioridade: prioridade.value,
        prazo: prazo.value,
        status: "pendente"
    });

    salvar();
    atualizar();

    titulo.value = "";
    descricao.value = "";
    prioridade.value = "baixa";
    prazo.value = "";

    titulo.focus();
}

// ==============================
// EXCLUIR TAREFA
// ==============================

function excluirTarefa(id) {
    if (!confirm("Deseja realmente excluir esta tarefa?")) {
        return;
    }

    tarefas = tarefas.filter(tarefa => tarefa.id !== id);

    salvar();
    atualizar();
}

// ==============================
// EDITAR TAREFA
// ==============================

function editarTarefa(id) {
    const tarefa = tarefas.find(t => t.id === id);

    if (!tarefa) return;

    const novoTitulo = prompt(
        "Digite o novo título:",
        tarefa.titulo
    );

    if (novoTitulo === null) return;

    if (!novoTitulo.trim()) {
        alert("O título não pode ficar vazio!");
        return;
    }

    const novaDescricao = prompt(
        "Digite a nova descrição:",
        tarefa.descricao
    );

    if (novaDescricao === null) return;

    const novaPrioridade = prompt(
        "Digite a prioridade: baixa, media ou alta",
        tarefa.prioridade
    );

    if (novaPrioridade === null) return;

    const prioridadeValida = ["baixa", "media", "alta"];

    if (!prioridadeValida.includes(novaPrioridade.trim().toLowerCase())) {
        alert("Prioridade inválida! Use baixa, media ou alta.");
        return;
    }

    const novoPrazo = prompt(
        "Digite o novo prazo (AAAA-MM-DD) ou deixe vazio:",
        tarefa.prazo
    );

    if (novoPrazo === null) return;

    tarefa.titulo = novoTitulo.trim();
    tarefa.descricao = novaDescricao.trim();
    tarefa.prioridade = novaPrioridade.trim().toLowerCase();
    tarefa.prazo = novoPrazo.trim();

    salvar();
    atualizar();
}

// ==============================
// ALTERAR STATUS
// ==============================

function alterarStatus(id, novoStatus) {
    const tarefa = tarefas.find(t => t.id === id);

    if (!tarefa) return;

    tarefa.status = novoStatus;

    salvar();
    atualizar();
}

// ==============================
// ATUALIZAR DASHBOARD E KANBAN
// ==============================

function atualizar() {
    const termo = pesquisa.value.toLowerCase();
    const prioridadeSelecionada = filtroPrioridade.value;
    const statusSelecionado = filtroStatus.value;

    const filtradas = tarefas.filter(tarefa => {
        return tarefa.titulo.toLowerCase().includes(termo) &&
            (!prioridadeSelecionada ||
                tarefa.prioridade === prioridadeSelecionada) &&
            (!statusSelecionado ||
                tarefa.status === statusSelecionado);
    });

    const statusPorColuna = [
        "pendente",
        "andamento",
        "concluida"
    ];

    colunas.forEach((coluna, indice) => {
        const cabecalho = coluna.querySelector("h3");

        coluna.innerHTML = "";
        coluna.appendChild(cabecalho);

        const status = statusPorColuna[indice];

        const tarefasDaColuna = filtradas.filter(
            tarefa => tarefa.status === status
        );

        if (tarefasDaColuna.length === 0) {
            const vazio = document.createElement("p");
            vazio.className = "vazio";
            vazio.textContent = "Nenhuma tarefa por aqui.";
            coluna.appendChild(vazio);
        }

        tarefasDaColuna.forEach(tarefa => {
            const card = document.createElement("div");
            card.className = "tarefa-card";

            const nome = document.createElement("h4");
            nome.textContent = tarefa.titulo;

            const desc = document.createElement("p");
            desc.textContent = tarefa.descricao || "Sem descrição.";

            const info = document.createElement("small");

            const prioridades = {
                baixa: "Baixa",
                media: "Média",
                alta: "Alta"
            };

            info.textContent =
                "Prioridade: " + prioridades[tarefa.prioridade] +
                (tarefa.prazo ? " | Prazo: " + tarefa.prazo : "");

            const seletor = document.createElement("select");

            [
                ["pendente", "A Fazer"],
                ["andamento", "Em Andamento"],
                ["concluida", "Concluídas"]
            ].forEach(([valor, texto]) => {
                const opcao = document.createElement("option");
                opcao.value = valor;
                opcao.textContent = texto;
                seletor.appendChild(opcao);
            });

            seletor.value = tarefa.status;

            seletor.onchange = () => {
                alterarStatus(tarefa.id, seletor.value);
            };

            const editar = document.createElement("button");
            editar.textContent = "Editar";
            editar.type = "button";
            editar.onclick = () => editarTarefa(tarefa.id);

            const excluir = document.createElement("button");
            excluir.textContent = "Excluir";
            excluir.type = "button";
            excluir.onclick = () => excluirTarefa(tarefa.id);

            card.append(
                nome,
                desc,
                info,
                document.createElement("br"),
                seletor,
                editar,
                excluir
            );

            coluna.appendChild(card);
        });
    });

    // ATUALIZAR NÚMEROS DO DASHBOARD

    const numeros = [
        tarefas.length,
        tarefas.filter(t => t.status === "pendente").length,
        tarefas.filter(t => t.status === "andamento").length,
        tarefas.filter(t => t.status === "concluida").length
    ];

    document.querySelectorAll(".card h2").forEach((elemento, indice) => {
        elemento.textContent = numeros[indice];
    });
}

// ==============================
// EVENTOS
// ==============================

botaoAdicionar.addEventListener("click", adicionarTarefa);

pesquisa.addEventListener("input", atualizar);

filtroPrioridade.addEventListener("change", atualizar);

filtroStatus.addEventListener("change", atualizar);

// INICIAR SISTEMA

atualizar();


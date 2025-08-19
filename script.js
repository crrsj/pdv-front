 const API_URL = "http://localhost:8080"; // backend Spring Boot
    let produtos = [];
    let carrinho = [];

    // Buscar produtos da API
    async function carregarProdutos() {
      try {
        const resp = await fetch(`${API_URL}/produtos`);
        produtos = await resp.json();

        const lista = document.getElementById("listaProdutos");
        lista.innerHTML = "";

        produtos.forEach(p => {
          lista.innerHTML += `
            <div class="col-md-6 mb-3">
              <div class="card shadow-sm h-100">
                <img src="${p.imgUrl}" class="card-img-top" alt="${p.nome}" style="height:180px; object-fit:cover;">
                <div class="card-body d-flex flex-column">
                  <h5 class="card-title">${p.nome}</h5>
                  <p class="card-text">R$ ${p.preco.toFixed(2)}</p>
                  <button class="btn btn-primary mt-auto" onclick="adicionarCarrinho(${p.id})">Adicionar</button>
                </div>
              </div>
            </div>
          `;
        });

      } catch (err) {
        console.error("Erro ao carregar produtos:", err);
        document.getElementById("listaProdutos").innerHTML = "<p class='text-danger'>Erro ao carregar produtos.</p>";
      }
       renderizarProdutos(produtos);
    }

    // Adicionar ao carrinho
    function adicionarCarrinho(id) {
      const produto = produtos.find(p => p.id === id);
      const item = carrinho.find(i => i.id === id);
      if (item) {
        item.qtd++;
      } else {
        carrinho.push({ ...produto, qtd: 1 });
      }
      atualizarCarrinho();
    }

    // Remover item
    function removerItem(id) {
      carrinho = carrinho.filter(i => i.id !== id);
      atualizarCarrinho();
    }

    // Atualizar carrinho
    function atualizarCarrinho() {
      const lista = document.getElementById("carrinho");
      const total = document.getElementById("total");
      lista.innerHTML = "";
      let soma = 0;

      carrinho.forEach(item => {
        const subtotal = item.preco * item.qtd;
        soma += subtotal;
        lista.innerHTML += `
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <div>
              ${item.nome} x${item.qtd}  
              <span class="text-muted">R$ ${subtotal.toFixed(2)}</span>
            </div>
            <button class="btn btn-sm btn-danger" onclick="removerItem(${item.id})">Excluir</button>
          </li>
        `;
      });

      total.innerText = soma.toFixed(2);
    }

    // Finalizar venda
    function finalizarVenda() {
      if (carrinho.length === 0) {
        alert("Carrinho vazio!");
        return;
      }
      const modal = new bootstrap.Modal(document.getElementById("modalPagamento"));
      modal.show();
    }

    // Enviar venda para API
    async function pagar(tipoPagamento) {
      try {
        const venda = {
          itens: carrinho.map(item => ({
            produtoId: item.id,
            quantidade: item.qtd
          })),
          formaPagamento: tipoPagamento
        };

        const resp = await fetch(`${API_URL}/vendas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(venda)
        });

        if (!resp.ok) {
          throw new Error("Erro ao registrar venda");
        }

        const vendaDTO = await resp.json(); 
        exibirVenda(vendaDTO);

        alert("Venda registrada com sucesso via " + tipoPagamento + "!");
        carrinho = [];
        atualizarCarrinho();
        bootstrap.Modal.getInstance(document.getElementById("modalPagamento")).hide();

      } catch (err) {
        console.error(err);
        alert("Erro ao processar pagamento.");
      }
    }


    function exibirVenda(vendaDTO) {
    document.getElementById("resumoVenda").style.display = "block";
    document.getElementById("dataVenda").innerText = new Date(vendaDTO.dataHora).toLocaleString();
    document.getElementById("formaPagamento").innerText = vendaDTO.formaPagamento;
    document.getElementById("totalVenda").innerText = vendaDTO.total.toFixed(2);

    const listaItens = document.getElementById("itensVenda");
    listaItens.innerHTML = "";

    vendaDTO.itens.forEach(item => {
        listaItens.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                ${item.nomeProduto} x${item.quantidade} 
                <span>R$ ${item.subtotal.toFixed(2)}</span>
            </li>
        `;
    });
}

function renderizarProdutos(produtos) {
    const lista = document.getElementById("listaProdutos");
    lista.innerHTML = "";

    produtos.forEach(produto => {
        const card = document.createElement("div");
        card.className = "col-sm-6 col-md-4 col-lg-3 mb-4";

        card.innerHTML = `
            <div class="card h-100">
                <img src="${produto.imgUrl}" class="card-img-top produto-img" alt="${produto.nome}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${produto.nome}</h5>
                    <p class="card-text">R$ ${produto.preco.toFixed(2)}</p>
                    <button class="btn btn-primary mt-auto" onclick="adicionarCarrinho(${produto.id})">Adicionar</button>
                </div>
            </div>
        `;
        lista.appendChild(card);
    });
}


    // Inicializar
    carregarProdutos();
const capitalInicial = document.querySelector("#capital-inicial")
const aportesMensal  = document.querySelector("#aporte-mensal")
const tipoTaxa       = document.querySelector("#tipo-taxa")
const taxaJuros      = document.querySelector("#taxa-juros")
const periodo        = document.querySelector("#periodo")
const botaoCalcular  = document.querySelector("#btn-calcular")
const form           = document.querySelector("form")

form.addEventListener("submit", (e) => e.preventDefault())

// ─── Formatar moeda ──────────────────────────────────────
function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// ─── Formatar input como moeda ao digitar ────────────────
function aplicarMascaraMoeda(input) {
  input.addEventListener("input", (e) => {
    let valor = e.target.value.replace(/\D/g, "")
    if (!valor) { e.target.value = ""; return }
    valor = (Number(valor) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
    e.target.value = valor
  })
}

// ─── Formatar input de taxa ao digitar ───────────────────
function aplicarMascaraTaxa(input) {
  input.addEventListener("input", (e) => {
    let valor = e.target.value.replace(/[^\d,]/g, "")
    // permite apenas um separador decimal
    const partes = valor.split(",")
    if (partes.length > 2) valor = partes[0] + "," + partes[1]
    e.target.value = valor
  })
}

// ─── Limpar moeda pra numero ─────────────────────────────
function limparMoeda(valor) {
  return Number(
    valor.replace("R$", "")
         .replace(/\./g, "")
         .replace(",", ".")
         .trim()
  ) || 0
}

// ─── Limpar taxa pra numero ──────────────────────────────
function limparTaxa(valor) {
  return Number(valor.replace(",", ".").replace("%", "").trim()) || 0
}

// ─── Converter taxa anual pra mensal ────────────────────
function taxaAnualParaMensal(taxaAnual) {
  return (Math.pow(1 + taxaAnual / 100, 1 / 12) - 1) * 100
}

// ─── Aplicar máscaras nos inputs ─────────────────────────
aplicarMascaraMoeda(capitalInicial)
aplicarMascaraMoeda(aportesMensal)
aplicarMascaraTaxa(taxaJuros)

// ─── Mostrar erro ────────────────────────────────────────
function mostrarErro(mensagem) {
  const erroExistente = document.querySelector(".erro-banner")
  if (erroExistente) erroExistente.remove()

  const banner = document.createElement("div")
  banner.className = "erro-banner"
  banner.textContent = `⚠️ ${mensagem}`

  form.insertBefore(banner, form.firstChild)
  setTimeout(() => banner.remove(), 3000)
}

// ─── Validação ───────────────────────────────────────────
function validarInputs(capital, taxa, meses) {
  if (capital < 0) {
    mostrarErro("O capital inicial não pode ser negativo!")
    return false
  }
  if (!taxa || taxa <= 0) {
    mostrarErro("Informe uma taxa de juros válida!")
    return false
  }
  if (!meses || meses < 1) {
    mostrarErro("Informe um período válido!")
    return false
  }
  return true
}

// ─── Cálculo juros compostos com aportes ─────────────────
function calcularJurosCompostos(capital, aporte, taxaMensal, meses) {
  const i = taxaMensal / 100

  const montanteCapital = capital * Math.pow(1 + i, meses)
  const montanteAportes = aporte > 0
    ? aporte * ((Math.pow(1 + i, meses) - 1) / i)
    : 0

  const montanteFinal  = montanteCapital + montanteAportes
  const totalInvestido = capital + (aporte * meses)
  const totalJuros     = montanteFinal - totalInvestido
  const taxaAnual      = (Math.pow(1 + i, 12) - 1) * 100
  const rendimento     = ((totalJuros / totalInvestido) * 100).toFixed(2)

  return { montanteFinal, totalInvestido, totalJuros, taxaAnual, rendimento }
}

// ─── Mostrar resultado ────────────────────────────────────
function mostrarResultado(resultado, taxaMensal, tipoTaxaValor) {
  const divResultado = document.querySelector("#resultado")

  const linhaConversao = tipoTaxaValor === "anual" ? `
    <div class="linha">
      <dt>Taxa Mensal Equivalente</dt>
      <dd>${taxaMensal.toFixed(4)}% a.m.</dd>
    </div>` : ""

  divResultado.innerHTML = `
    <dl>
      <div class="linha">
        <dt>Total Investido</dt>
        <dd>${formatarMoeda(resultado.totalInvestido)}</dd>
      </div>
      <div class="linha">
        <dt>Total em Juros</dt>
        <dd>${formatarMoeda(resultado.totalJuros)}</dd>
      </div>
      <div class="linha">
        <dt>Rendimento Total</dt>
        <dd>${resultado.rendimento}%</dd>
      </div>
      ${linhaConversao}
      <div class="linha">
        <dt>Taxa Anual Equivalente</dt>
        <dd>${resultado.taxaAnual.toFixed(2)}% a.a.</dd>
      </div>
      <div class="linha destaque">
        <dt>Montante Final</dt>
        <dd>${formatarMoeda(resultado.montanteFinal)}</dd>
      </div>
    </dl>
  `
}

// ─── Evento do botão ─────────────────────────────────────
botaoCalcular.addEventListener("click", () => {
  const capital        = limparMoeda(capitalInicial.value)
  const aporte         = limparMoeda(aportesMensal.value)
  const taxaDigitada   = limparTaxa(taxaJuros.value)
  const meses          = Number(periodo.value)
  const tipoTaxaValor  = tipoTaxa.value

  // converte pra mensal se for anual
  const taxaMensal = tipoTaxaValor === "anual"
    ? taxaAnualParaMensal(taxaDigitada)
    : taxaDigitada

  if (!validarInputs(capital, taxaDigitada, meses)) return

  const resultado = calcularJurosCompostos(capital, aporte, taxaMensal, meses)
  mostrarResultado(resultado, taxaMensal, tipoTaxaValor)
})
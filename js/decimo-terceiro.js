const salarioBase      = document.querySelector("#salario-base")
const mesesTrabalhados = document.querySelector("#meses-trabalhados")
const parcela          = document.querySelector("#parcela")
const botaoCalcular    = document.querySelector("#btn-calcular")
const form             = document.querySelector("form")

form.addEventListener("submit", (e) => e.preventDefault())

// ─── Tabela INSS 2024 ────────────────────────────────────
function calcularINSS(salario) {
  if (salario <= 1412.00) return salario * 0.075
  if (salario <= 2666.68) return salario * 0.09
  if (salario <= 4000.03) return salario * 0.12
  if (salario <= 7786.02) return salario * 0.14
  return 7786.02 * 0.14
}

// ─── Tabela IR 2024 ──────────────────────────────────────
function calcularIR2026(baseCalculo) {
  let impostoBase = 0;

  // 1. Cálculo pela Tabela Progressiva Padrão
  if (baseCalculo <= 2259.20) impostoBase = 0;
  else if (baseCalculo <= 2826.65) impostoBase = baseCalculo * 0.075 - 169.44;
  else if (baseCalculo <= 3751.05) impostoBase = baseCalculo * 0.15  - 381.44;
  else if (baseCalculo <= 4664.68) impostoBase = baseCalculo * 0.225 - 662.77;
  else impostoBase = baseCalculo * 0.275 - 896.00;

  // 2. Aplicação do Novo Redutor de 2026
  let redutor = 0;
  if (baseCalculo <= 5000.00) {
    redutor = 312.89; // Zera o imposto para quem ganha até 5k
  } else if (baseCalculo <= 7350.00) {
    // Redutor parcial para quem ganha entre 5k e 7.35k
    redutor = 978.62 - (0.133145 * baseCalculo);
  }

  const impostoFinal = impostoBase - redutor;
  return Math.max(0, impostoFinal);
}

// ─── Formatar moeda ──────────────────────────────────────
function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

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
function validarInputs(salario, meses) {
  if (!salario || salario <= 0) {
    mostrarErro("Informe um salário válido!")
    return false
  }
  if (!meses || meses < 1 || meses > 12) {
    mostrarErro("Informe os meses trabalhados (1 a 12)!")
    return false
  }
  return true
}

// ─── Cálculo ─────────────────────────────────────────────
function calcularDecimoTerceiro(salario, meses, qual) {
  const proporcional  = (salario / 12) * meses
  const primeiraParte = proporcional / 2

  const inss = calcularINSS(proporcional)
  const baseIR = proporcional - inss
  const ir = calcularIR2026(baseIR)
  const segundaParte = proporcional / 2 - inss - ir

  const total = primeiraParte + segundaParte

  return { proporcional, primeiraParte, inss, ir, segundaParte, total }
}

// ─── Mostrar resultado ────────────────────────────────────
function mostrarResultado(resultado, qual) {
  const divResultado = document.querySelector("#resultado")
  let linhas = ""

  if (qual === "primeira") {
    linhas = `
      <div class="linha">
        <dt>Valor Proporcional</dt>
        <dd>${formatarMoeda(resultado.proporcional)}</dd>
      </div>
      <div class="linha destaque">
        <dt>1ª Parcela (sem descontos)</dt>
        <dd>${formatarMoeda(resultado.primeiraParte)}</dd>
      </div>
    `
  } else if (qual === "segunda") {
    linhas = `
      <div class="linha">
        <dt>Valor Proporcional</dt>
        <dd>${formatarMoeda(resultado.proporcional)}</dd>
      </div>
      <div class="linha">
        <dt>Desconto INSS</dt>
        <dd>- ${formatarMoeda(resultado.inss)}</dd>
      </div>
      <div class="linha">
        <dt>Desconto IR</dt>
        <dd>- ${formatarMoeda(resultado.ir)}</dd>
      </div>
      <div class="linha destaque">
        <dt>2ª Parcela (líquida)</dt>
        <dd>${formatarMoeda(resultado.segundaParte)}</dd>
      </div>
    `
  } else {
    linhas = `
      <div class="linha">
        <dt>Valor Proporcional Bruto</dt>
        <dd>${formatarMoeda(resultado.proporcional)}</dd>
      </div>
      <div class="linha">
        <dt>1ª Parcela</dt>
        <dd>${formatarMoeda(resultado.primeiraParte)}</dd>
      </div>
      <div class="linha">
        <dt>Desconto INSS</dt>
        <dd>- ${formatarMoeda(resultado.inss)}</dd>
      </div>
      <div class="linha">
        <dt>Desconto IR</dt>
        <dd>- ${formatarMoeda(resultado.ir)}</dd>
      </div>
      <div class="linha">
        <dt>2ª Parcela Líquida</dt>
        <dd>${formatarMoeda(resultado.segundaParte)}</dd>
      </div>
      <div class="linha destaque">
        <dt>Total Líquido</dt>
        <dd>${formatarMoeda(resultado.total)}</dd>
      </div>
    `
  }

  divResultado.innerHTML = `<dl>${linhas}</dl>`
}

// ─── Evento do botão ─────────────────────────────────────
botaoCalcular.addEventListener("click", () => {
  const salario = Number(salarioBase.value)
  const meses   = Number(mesesTrabalhados.value)
  const qual    = parcela.value

  if (!validarInputs(salario, meses)) return

  const resultado = calcularDecimoTerceiro(salario, meses, qual)
  mostrarResultado(resultado, qual)
})

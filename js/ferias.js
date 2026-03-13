const salarioBaseInput      = document.querySelector("#salario-base")
const mesesTrabalhadosInput = document.querySelector("#meses-trabalhados")
const venderFeriasInput     = document.querySelector("#vender-ferias")
const adiantamento13Input   = document.querySelector("#adiantamento-13")
const botaoCalcular         = document.querySelector("#btn-calcular")
const form                  = document.querySelector("form")

form.addEventListener("submit", (e) => e.preventDefault())

aplicarMascaraMoeda(salarioBaseInput)

// ─── Validação ───────────────────────────────────────────
function validarInputs(salario, meses) {
  if (!salario || salario <= 0) {
    mostrarErro(form, "Informe um salário válido!")
    return false
  }
  if (!meses || meses < 1 || meses > 12) {
    mostrarErro(form, "Informe os meses trabalhados (1 a 12)!")
    return false
  }
  return true
}

// ─── Cálculo ─────────────────────────────────────────────
function calcularFerias(salario, meses, vender, adiantamento13) {
  const proporcional            = meses / 12
  const valorMensalProporcional = salario * proporcional
  const valorDiario             = valorMensalProporcional / 30

  // 1. Definição de dias
  const diasVenda = vender === "sim" ? 10 : 0
  const diasGozo  = 30 - diasVenda

  // 2. Verbas Tributáveis (dias de descanso + 1/3 sobre eles)
  const valorGozo        = valorDiario * diasGozo
  const tercoTributavel  = valorGozo / 3
  const totalTributavel  = valorGozo + tercoTributavel

  // 3. Verbas Isentas (abono + 1/3 sobre o abono + adto 13º)
  const valorAbono  = diasVenda > 0 ? valorDiario * 10 : 0
  const tercoIsento = valorAbono / 3
  const valorAdto13 = adiantamento13 === "sim" ? (salario * 0.5 * proporcional) : 0
  const totalIsento = valorAbono + tercoIsento + valorAdto13

  // 4. Descontos (apenas sobre o tributável)
  const inss = calcularINSS(totalTributavel)
  const ir   = calcularIR(totalTributavel - inss)

  // 5. Total
  const totalLiquido = totalTributavel - inss - ir + totalIsento

  return {
    baseCalculoImposto: totalTributavel,
    detalhes: {
      feriasGozo:           valorGozo,
      tercoTributavel:      tercoTributavel,
      abonoPecuniario:      valorAbono,
      tercoIsento:          tercoIsento,
      tercoTotal:           tercoTributavel + tercoIsento,
      adiantamento13:       valorAdto13,
    },
    descontos: { inss, ir },
    totalIsento,
    totalLiquido,
    vender
  }
}

// ─── Mostrar resultado ────────────────────────────────────
function mostrarResultado(r) {
  const divResultado = document.querySelector("#resultado")
  const d = r.detalhes

  const linhasAbono = r.vender === "sim" ? `
      <div class="linha">
        <dt>Abono Pecuniário (10 dias)</dt>
        <dd>${formatarMoeda(d.abonoPecuniario)}</dd>
      </div>
      <div class="linha">
        <dt>1/3 sobre o Abono (isento)</dt>
        <dd>${formatarMoeda(d.tercoIsento)}</dd>
      </div>` : ""

  const linhaAdto = d.adiantamento13 > 0 ? `
      <div class="linha">
        <dt>Adiantamento 13º Salário (50%)</dt>
        <dd>${formatarMoeda(d.adiantamento13)}</dd>
      </div>` : ""

  const notaLegal = r.vender === "sim"
    ? `<p class="nota-legal">⚖️ Súmula 328 TST: o 1/3 constitucional incide sobre os 30 dias integrais (${formatarMoeda(d.tercoTotal)} no total). O abono pecuniário e seu 1/3 são isentos de INSS e IR por terem natureza indenizatória.</p>`
    : ""

  divResultado.innerHTML = `
    <dl>
      <div class="linha">
        <dt>Férias Gozadas (${r.vender === "sim" ? "20" : "30"} dias)</dt>
        <dd>${formatarMoeda(d.feriasGozo)}</dd>
      </div>
      <div class="linha">
        <dt>1/3 Constitucional (sobre dias gozados)</dt>
        <dd>${formatarMoeda(d.tercoTributavel)}</dd>
      </div>
      ${linhasAbono}
      <div class="linha">
        <dt>Base para INSS e IR</dt>
        <dd>${formatarMoeda(r.baseCalculoImposto)}</dd>
      </div>
      <div class="linha">
        <dt>Desconto INSS</dt>
        <dd>- ${formatarMoeda(r.descontos.inss)}</dd>
      </div>
      <div class="linha">
        <dt>Desconto IRPF</dt>
        <dd>- ${formatarMoeda(r.descontos.ir)}</dd>
      </div>
      ${linhaAdto}
      <div class="linha destaque">
        <dt>Total Líquido a Receber</dt>
        <dd>${formatarMoeda(r.totalLiquido)}</dd>
      </div>
    </dl>
    ${notaLegal}
  `
}

// ─── Evento do botão ─────────────────────────────────────
botaoCalcular.addEventListener("click", () => {
  const salario      = limparMoeda(salarioBaseInput.value)
  const meses        = Number(mesesTrabalhadosInput.value)
  const vender       = venderFeriasInput.value
  const adiantamento = adiantamento13Input.value

  if (!validarInputs(salario, meses)) return

  const resultado = calcularFerias(salario, meses, vender, adiantamento)
  mostrarResultado(resultado)
})
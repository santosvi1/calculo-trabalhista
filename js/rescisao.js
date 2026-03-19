const dataAdmissaoInput  = document.querySelector("#data-admissao")
const dataSaidaInput     = document.querySelector("#data-saida")
const salarioBaseInput   = document.querySelector("#salario-base")
const tipoRescisaoInput  = document.querySelector("#tipo-rescisao")
const botaoCalcular      = document.querySelector("#btn-calcular")
const form               = document.querySelector("form")
const infoPeriodo        = document.querySelector("#info-periodo")
const tempoEmpresaSpan   = document.querySelector("#tempo-empresa")
const mesesAnoSpan       = document.querySelector("#meses-ano")
const diasMesSpan        = document.querySelector("#dias-mes")

form.addEventListener("submit", (e) => e.preventDefault())
aplicarMascaraMoeda(salarioBaseInput)

// ─── Calcular período a partir das datas ─────────────────
function calcularPeriodo(admissao, saida) {
  const dAdm  = new Date(admissao)
  const dSaid = new Date(saida)

  // anos e meses totais de empresa
  let anos  = dSaid.getFullYear() - dAdm.getFullYear()
  let meses = dSaid.getMonth()    - dAdm.getMonth()

  if (meses < 0) { anos--; meses += 12 }

  const totalMeses = anos * 12 + meses

  // meses trabalhados no ano corrente (para 13º e férias)
  // considera do início do ano até a data de saída
  // ou da admissão se foi admitido no mesmo ano
  const anoSaida    = dSaid.getFullYear()
  const inicioAno   = new Date(anoSaida, 0, 1) // 1 jan do ano de saída
  const refInicio   = dAdm > inicioAno ? dAdm : inicioAno
  let mesesNoAno    = dSaid.getMonth() - refInicio.getMonth()
  if (mesesNoAno <= 0 && dSaid.getDate() >= refInicio.getDate()) mesesNoAno = 1
  mesesNoAno = Math.max(1, Math.min(12, dSaid.getMonth() - refInicio.getMonth() + 1))

  // dias trabalhados no último mês
  const diasNoMes = dSaid.getDate()

  return { anos, meses, totalMeses, mesesNoAno, diasNoMes }
}

// ─── Formatar tempo de empresa legível ───────────────────
function formatarTempo(anos, meses) {
  const partes = []
  if (anos > 0)  partes.push(`${anos} ano${anos > 1 ? "s" : ""}`)
  if (meses > 0) partes.push(`${meses} ${meses > 1 ? "meses" : "mês"}`)
  return partes.length ? partes.join(" e ") : "menos de 1 mês"
}

// ─── Atualizar info do período ao mudar datas ─────────────
function atualizarInfoPeriodo() {
  const admissao = dataAdmissaoInput.value
  const saida    = dataSaidaInput.value

  if (!admissao || !saida || new Date(admissao) >= new Date(saida)) {
    infoPeriodo.style.display = "none"
    return
  }

  const p = calcularPeriodo(admissao, saida)
  tempoEmpresaSpan.textContent = formatarTempo(p.anos, p.meses)
  mesesAnoSpan.textContent     = `${p.mesesNoAno} mês${p.mesesNoAno > 1 ? "es" : ""}`
  diasMesSpan.textContent      = `${p.diasNoMes} dia${p.diasNoMes > 1 ? "s" : ""}`
  infoPeriodo.style.display    = "block"
}

dataAdmissaoInput.addEventListener("change", atualizarInfoPeriodo)
dataSaidaInput.addEventListener("change", atualizarInfoPeriodo)

// ─── Validação ───────────────────────────────────────────
function validarInputs(admissao, saida, salario) {
  if (!admissao) {
    mostrarErro(form, "Informe a data de admissão!")
    return false
  }
  if (!saida) {
    mostrarErro(form, "Informe a data de saída!")
    return false
  }
  if (new Date(admissao) >= new Date(saida)) {
    mostrarErro(form, "A data de saída deve ser posterior à admissão!")
    return false
  }
  if (!salario || salario <= 0) {
    mostrarErro(form, "Informe um salário válido!")
    return false
  }
  return true
}

// ─── Cálculo ─────────────────────────────────────────────
function calcularRescisao(salario, periodo, tipo) {
  const { totalMeses, mesesNoAno, diasNoMes } = periodo
  const proporcional = mesesNoAno / 12

  const saldoSalario = (salario / 30) * diasNoMes
  const feriasBruto  = salario * proporcional
  const umTerco      = feriasBruto / 3
  const totalFerias  = feriasBruto + umTerco
  const decimoProp   = tipo !== "justa-causa" ? salario * proporcional : 0
  const avisoPrevio  = tipo === "sem-justa-causa" ? salario : 0
  const saldoFgts    = salario * 0.08 * totalMeses
  const multaFgts    = tipo === "sem-justa-causa" ? saldoFgts * 0.40 : 0

  const baseTributavel = saldoSalario + totalFerias + decimoProp + avisoPrevio
  const inss           = calcularINSS(baseTributavel)
  const ir             = calcularIR(baseTributavel - inss)
  const totalLiquido   = baseTributavel - inss - ir + saldoFgts + multaFgts

  return {
    saldoSalario, feriasBruto, umTerco, totalFerias,
    decimoProp, avisoPrevio, baseTributavel,
    inss, ir, saldoFgts, multaFgts,
    totalLiquido, tipo, periodo
  }
}

// ─── Mostrar resultado ────────────────────────────────────
function mostrarResultado(r) {
  const divResultado = document.querySelector("#resultado")
  const p = r.periodo

  divResultado.innerHTML = `
    <dl>
      <div class="linha">
        <dt>Tempo de Empresa</dt>
        <dd>${formatarTempo(p.anos, p.meses)} (${p.totalMeses} meses)</dd>
      </div>
      <div class="linha">
        <dt>Saldo de Salário (${p.diasNoMes} dias)</dt>
        <dd>${formatarMoeda(r.saldoSalario)}</dd>
      </div>
      <div class="linha">
        <dt>Férias Proporcionais (${p.mesesNoAno} meses)</dt>
        <dd>${formatarMoeda(r.feriasBruto)}</dd>
      </div>
      <div class="linha">
        <dt>1/3 Constitucional</dt>
        <dd>${formatarMoeda(r.umTerco)}</dd>
      </div>
      ${r.tipo !== "justa-causa" ? `
      <div class="linha">
        <dt>13º Proporcional (${p.mesesNoAno} meses)</dt>
        <dd>${formatarMoeda(r.decimoProp)}</dd>
      </div>` : ""}
      ${r.tipo === "sem-justa-causa" ? `
      <div class="linha">
        <dt>Aviso Prévio Indenizado</dt>
        <dd>${formatarMoeda(r.avisoPrevio)}</dd>
      </div>` : ""}
      <div class="linha">
        <dt>Base para INSS e IR</dt>
        <dd>${formatarMoeda(r.baseTributavel)}</dd>
      </div>
      <div class="linha">
        <dt>Desconto INSS</dt>
        <dd>- ${formatarMoeda(r.inss)}</dd>
      </div>
      <div class="linha">
        <dt>Desconto IRPF</dt>
        <dd>- ${formatarMoeda(r.ir)}</dd>
      </div>
      <div class="linha">
        <dt>Saldo FGTS — ${p.totalMeses} meses (isento)</dt>
        <dd>${formatarMoeda(r.saldoFgts)}</dd>
      </div>
      ${r.tipo === "sem-justa-causa" ? `
      <div class="linha">
        <dt>Multa FGTS 40% (isenta)</dt>
        <dd>${formatarMoeda(r.multaFgts)}</dd>
      </div>` : ""}
      <div class="linha destaque">
        <dt>Total Líquido da Rescisão</dt>
        <dd>${formatarMoeda(r.totalLiquido)}</dd>
      </div>
    </dl>
    <p class="nota-legal">⚖️ FGTS e multa de 40% são isentos de INSS e IR. Os descontos incidem sobre: saldo salário + férias + 13º + aviso prévio.</p>
  `
}

// ─── Evento do botão ─────────────────────────────────────
botaoCalcular.addEventListener("click", () => {
  const admissao = dataAdmissaoInput.value
  const saida    = dataSaidaInput.value
  const salario  = limparMoeda(salarioBaseInput.value)
  const tipo     = tipoRescisaoInput.value

  if (!validarInputs(admissao, saida, salario)) return

  const periodo  = calcularPeriodo(admissao, saida)
  const resultado = calcularRescisao(salario, periodo, tipo)
  mostrarResultado(resultado)
})
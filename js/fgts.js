const salarioBaseInput      = document.querySelector("#salario-base")
const mesesTrabalhadosInput = document.querySelector("#meses-trabalhados")
const tipoRescisaoInput     = document.querySelector("#tipo-rescisao")
const botaoCalcular         = document.querySelector("#btn-calcular")
const form                  = document.querySelector("form")

form.addEventListener("submit", (e) => e.preventDefault())

// ✅ passa o elemento, não o valor
aplicarMascaraMoeda(salarioBaseInput)

// ─── Validação ───────────────────────────────────────────
function validarInputs(salario, meses) {
  if (!salario || salario <= 0) {
    mostrarErro(form, "Informe um salário válido!")  // ✅ passa form
    return false
  }
  if (!meses || meses < 1) {
    mostrarErro(form, "Informe os meses trabalhados!")
    return false
  }
  return true
}

// ─── Cálculo ─────────────────────────────────────────────
function calcularFGTS(salario, meses, tipo) {
  const depositoMensal = salario * 0.08
  const saldoTotal     = depositoMensal * meses
  const multa40        = tipo === "sem-justa-causa" ? saldoTotal * 0.40 : 0
  const totalSaque     = saldoTotal + multa40

  return { depositoMensal, saldoTotal, multa40, totalSaque, tipo }
}

// ─── Mostrar resultado ────────────────────────────────────
function mostrarResultado(r) {
  const divResultado = document.querySelector("#resultado")

  const linhaMulta = r.tipo === "sem-justa-causa"
    ? `<div class="linha">
        <dt>Multa Rescisória (40%)</dt>
        <dd>${formatarMoeda(r.multa40)}</dd>
       </div>`
    : `<div class="linha">
        <dt>Multa Rescisória (40%)</dt>
        <dd>Não aplicável</dd>
       </div>`

  divResultado.innerHTML = `
    <dl>
      <div class="linha">
        <dt>Depósito Mensal (8% do salário)</dt>
        <dd>${formatarMoeda(r.depositoMensal)}</dd>
      </div>
      <div class="linha">
        <dt>Saldo Total Acumulado</dt>
        <dd>${formatarMoeda(r.saldoTotal)}</dd>
      </div>
      ${linhaMulta}
      <div class="linha destaque">
        <dt>Total a Sacar</dt>
        <dd>${formatarMoeda(r.totalSaque)}</dd>
      </div>
    </dl>
    ${r.tipo === "sem-justa-causa"
      ? `<p class="nota-legal">⚖️ Além da multa de 40% sacável, o empregador recolhe 10% do saldo à União (Lei 9.491/97). Esse valor não é sacado pelo trabalhador.</p>`
      : ""}
  `
}

// ─── Evento do botão ─────────────────────────────────────
botaoCalcular.addEventListener("click", () => {
  const salario = limparMoeda(salarioBaseInput.value) // ✅ limparMoeda, não Number()
  const meses   = Number(mesesTrabalhadosInput.value)
  const tipo    = tipoRescisaoInput.value

  if (!validarInputs(salario, meses)) return

  const resultado = calcularFGTS(salario, meses, tipo)
  mostrarResultado(resultado)
})
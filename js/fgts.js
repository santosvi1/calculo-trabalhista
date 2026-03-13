const salarioBase      = document.querySelector("#salario-base")
const mesesTrabalhados = document.querySelector("#meses-trabalhados")
const tipoRescisao     = document.querySelector("#tipo-rescisao")
const botaoCalcular    = document.querySelector("#btn-calcular")
const form             = document.querySelector("form")

form.addEventListener("submit", (e) => e.preventDefault())

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function mostrarErro(mensagem) {
  const erroExistente = document.querySelector(".erro-banner")
  if (erroExistente) erroExistente.remove()

  const banner = document.createElement("div")
  banner.className = "erro-banner"
  banner.textContent = `⚠️ ${mensagem}`

  form.insertBefore(banner, form.firstChild)
  setTimeout(() => banner.remove(), 3000)
}

function validarInputs(salario, meses) {
  if (!salario || salario <= 0) {
    mostrarErro("Informe um salário válido!")
    return false
  }
  if (!meses || meses < 1) {
    mostrarErro("Informe os meses trabalhados!")
    return false
  }
  return true
}

function calcularFGTS(salario, meses, tipo) {
  const depositoMensal = salario * 0.08
  const saldoTotal     = depositoMensal * meses
  const multa40        = tipo === "sem-justa-causa" ? saldoTotal * 0.40 : 0
  const totalSaque     = saldoTotal + multa40

  return { depositoMensal, saldoTotal, multa40, totalSaque, tipo }
}

function mostrarResultado(resultado) {
  const divResultado = document.querySelector("#resultado")

  const linhaMulta = resultado.tipo === "sem-justa-causa" ? `
    <div class="linha">
      <dt>Multa de 40%</dt>
      <dd>${formatarMoeda(resultado.multa40)}</dd>
    </div>` : `
    <div class="linha">
      <dt>Multa de 40%</dt>
      <dd>Não aplicável</dd>
    </div>`

  divResultado.innerHTML = `
    <dl>
      <div class="linha">
        <dt>Depósito Mensal (8%)</dt>
        <dd>${formatarMoeda(resultado.depositoMensal)}</dd>
      </div>
      <div class="linha">
        <dt>Saldo Total Acumulado</dt>
        <dd>${formatarMoeda(resultado.saldoTotal)}</dd>
      </div>
      ${linhaMulta}
      <div class="linha destaque">
        <dt>Total a Receber</dt>
        <dd>${formatarMoeda(resultado.totalSaque)}</dd>
      </div>
    </dl>
  `
}

botaoCalcular.addEventListener("click", () => {
  const salario = Number(salarioBase.value)
  const meses   = Number(mesesTrabalhados.value)
  const tipo    = tipoRescisao.value

  if (!validarInputs(salario, meses)) return

  const resultado = calcularFGTS(salario, meses, tipo)
  mostrarResultado(resultado)
})

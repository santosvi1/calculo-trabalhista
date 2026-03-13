const salarioBaseInput = document.querySelector("#salario-base")
console.log(salarioBaseInput)
const horasExtraCinquentaInput = document.querySelector("#horas-extras-50")
const horasExtraCemInput = document.querySelector("#horas-extras-100")
const botaoCalcular = document.querySelector("#btn-calcular")
const form = document.querySelector("form")

form.addEventListener("submit", (e) => e.preventDefault())

// ─── Máscaras ────────────────────────────────────────────
aplicarMascaraMoeda(salarioBaseInput)

// ─── Validação ───────────────────────────────────────────
function validarInputs(salario, hCinquenta, hCem) {
  if (!salario || salario <= 0) {
    mostrarErro(form, "Informe um salário válido!")
    return false
  }
  if (hCinquenta < 0 || hCem < 0) {
    mostrarErro(form, "Horas extras não podem ser negativas!")
    return false
  }
  return true
}

// ─── Cálculo principal ───────────────────────────────────
function calcularSalario(salario, hCinquenta, hCem) {
  const valorDaHora = salario / 220
  const horaCinquenta = hCinquenta * valorDaHora * 1.5
  const horaCem = hCem * valorDaHora * 2.0
  const salarioBruto = salario + horaCinquenta + horaCem

  const inss = calcularINSS(salarioBruto)
  const baseIR = salarioBruto - inss
  const ir = calcularIR(baseIR)
  const fgts = salarioBruto * 0.08
  const salarioLiquido = salarioBruto - inss - ir

  return { valorDaHora, horaCinquenta, horaCem, salarioBruto, inss, ir, fgts, salarioLiquido }
}

// ─── Mostrar resultado ────────────────────────────────────
function mostrarResultado(salario, r) {
  const divResultado = document.querySelector("#resultado")

  divResultado.innerHTML = `
    <dl>
      <div class="linha">
        <dt>Salário Base</dt>
        <dd>${formatarMoeda(salario)}</dd>
      </div>
      <div class="linha">
        <dt>Valor da Hora</dt>
        <dd>${formatarMoeda(r.valorDaHora)}</dd>
      </div>
      <div class="linha">
        <dt>Horas Extras 50%</dt>
        <dd>${formatarMoeda(r.horaCinquenta)}</dd>
      </div>
      <div class="linha">
        <dt>Horas Extras 100%</dt>
        <dd>${formatarMoeda(r.horaCem)}</dd>
      </div>
      <div class="linha">
        <dt>Salário Bruto</dt>
        <dd>${formatarMoeda(r.salarioBruto)}</dd>
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
        <dt>FGTS (depositado pelo empregador)</dt>
        <dd>${formatarMoeda(r.fgts)}</dd>
      </div>
      <div class="linha destaque">
        <dt>Salário Líquido</dt>
        <dd>${formatarMoeda(r.salarioLiquido)}</dd>
      </div>
    </dl>
  `
}

// ─── Evento do botão ─────────────────────────────────────
botaoCalcular.addEventListener("click", () => {
  const salario    = limparMoeda(salarioBaseInput.value)
  const hCinquenta = Number(horasExtraCinquentaInput.value) || 0
  const hCem       = Number(horasExtraCemInput.value) || 0

  if (!validarInputs(salario, hCinquenta, hCem)) return

  const resultado = calcularSalario(salario, hCinquenta, hCem)
  mostrarResultado(salario, resultado)
})

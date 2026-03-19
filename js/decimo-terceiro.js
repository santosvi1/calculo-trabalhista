const salarioBaseInput      = document.querySelector("#salario-base")
const mesesTrabalhadosInput = document.querySelector("#meses-trabalhados")
const parcelaInput          = document.querySelector("#parcela")
const botaoCalcular         = document.querySelector("#btn-calcular")
const form                  = document.querySelector("form")

form.addEventListener("submit", (e) => e.preventDefault())

// ✅ passa o elemento
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
// Regras do 13º salário:
//   Proporcional = salário × (meses / 12)
//   1ª parcela   = 50% do proporcional — SEM descontos (Lei 4.749/65)
//   2ª parcela   = 50% do proporcional — COM INSS e IR sobre o total
//   INSS e IR incidem sobre o TOTAL proporcional, não sobre a metade

function calcularDecimoTerceiro(salario, meses) {
  const proporcional  = salario * (meses / 12)
  const primeiraParte = proporcional / 2

  // descontos calculados sobre o TOTAL, descontados na 2ª parcela
  const inss         = calcularINSS(proporcional)
  const baseIR       = proporcional - inss
  const ir           = calcularIR(baseIR)
  const segundaParte = (proporcional / 2) - inss - ir
  const total        = primeiraParte + segundaParte  // = proporcional - inss - ir

  return { proporcional, primeiraParte, inss, ir, segundaParte, total }
}

// ─── Mostrar resultado ────────────────────────────────────
function mostrarResultado(r, qual) {
  const divResultado = document.querySelector("#resultado")
  let linhas = ""

  if (qual === "primeira") {
    linhas = `
      <div class="linha">
        <dt>Valor Proporcional Bruto</dt>
        <dd>${formatarMoeda(r.proporcional)}</dd>
      </div>
      <div class="linha destaque">
        <dt>1ª Parcela (sem descontos)</dt>
        <dd>${formatarMoeda(r.primeiraParte)}</dd>
      </div>
    `
  } else if (qual === "segunda") {
    linhas = `
      <div class="linha">
        <dt>Valor Proporcional Bruto</dt>
        <dd>${formatarMoeda(r.proporcional)}</dd>
      </div>
      <div class="linha">
        <dt>Desconto INSS</dt>
        <dd>- ${formatarMoeda(r.inss)}</dd>
      </div>
      <div class="linha">
        <dt>Desconto IRPF</dt>
        <dd>- ${formatarMoeda(r.ir)}</dd>
      </div>
      <div class="linha destaque">
        <dt>2ª Parcela Líquida</dt>
        <dd>${formatarMoeda(r.segundaParte)}</dd>
      </div>
    `
  } else {
    linhas = `
      <div class="linha">
        <dt>Valor Proporcional Bruto</dt>
        <dd>${formatarMoeda(r.proporcional)}</dd>
      </div>
      <div class="linha">
        <dt>1ª Parcela (sem descontos)</dt>
        <dd>${formatarMoeda(r.primeiraParte)}</dd>
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
        <dt>2ª Parcela Líquida</dt>
        <dd>${formatarMoeda(r.segundaParte)}</dd>
      </div>
      <div class="linha destaque">
        <dt>Total Líquido</dt>
        <dd>${formatarMoeda(r.total)}</dd>
      </div>
    `
  }

  divResultado.innerHTML = `<dl>${linhas}</dl>`
}

// ─── Evento do botão ─────────────────────────────────────
botaoCalcular.addEventListener("click", () => {
  const salario = limparMoeda(salarioBaseInput.value) // ✅ limparMoeda
  const meses   = Number(mesesTrabalhadosInput.value)
  const qual    = parcelaInput.value

  if (!validarInputs(salario, meses)) return

  const resultado = calcularDecimoTerceiro(salario, meses)
  mostrarResultado(resultado, qual)
})
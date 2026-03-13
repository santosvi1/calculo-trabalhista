// ═══════════════════════════════════════════════════════
// utils.js — funções compartilhadas (valores 2026)
// Fontes: Portaria MPS/MF nº 13/2026 (INSS) | Lei nº 15.270/2025 (IR)
// ═══════════════════════════════════════════════════════

// ─── Formatar moeda ──────────────────────────────────────
function formatarMoeda(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// ─── Limpar moeda pra número ─────────────────────────────
function limparMoeda(valor) {
  if (!valor) return 0
  return Number(
    valor.replace("R$", "")
         .replace(/\./g, "")
         .replace(",", ".")
         .trim()
  ) || 0
}

// ─── Máscara de moeda nos inputs ─────────────────────────
function aplicarMascaraMoeda(input) {
  input.addEventListener("keydown", (e) => {
    const teclaPermitida = [
      "Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"
    ].includes(e.key)
    const ehNumero = /^[0-9]$/.test(e.key)
    if (!teclaPermitida && !ehNumero) e.preventDefault()
  })

  input.addEventListener("input", (e) => {
    let valor = e.target.value.replace(/\D/g, "")
    if (!valor) { e.target.value = ""; return }
    e.target.value = (Number(valor) / 100).toLocaleString('pt-BR', {
      style: 'currency', currency: 'BRL'
    })
  })
}

// ─── Mostrar erro ────────────────────────────────────────
function mostrarErro(form, mensagem) {
  const erroExistente = document.querySelector(".erro-banner")
  if (erroExistente) erroExistente.remove()
  const banner = document.createElement("div")
  banner.className = "erro-banner"
  banner.textContent = `⚠️ ${mensagem}`
  form.insertBefore(banner, form.firstChild)
  setTimeout(() => banner.remove(), 3000)
}

// ═══════════════════════════════════════════════════════
// INSS 2026 — Portaria Interministerial MPS/MF nº 13/2026
// Cálculo PROGRESSIVO (faixa a faixa) — igual ao IR
// Teto: R$ 8.475,55 | Desconto máximo: R$ 988,07
//
// Faixa 1: até R$ 1.621,00          → 7,5%
// Faixa 2: R$ 1.621,01 a R$ 2.902,84 → 9%
// Faixa 3: R$ 2.902,85 a R$ 4.354,27 → 12%
// Faixa 4: R$ 4.354,28 a R$ 8.475,55 → 14%
// ═══════════════════════════════════════════════════════
function calcularINSS(salario) {
  const teto = 8475.55
  const base = Math.min(salario, teto)

  let inss = 0

  if (base > 0)       inss += Math.min(base, 1621.00) * 0.075
  if (base > 1621.00) inss += (Math.min(base, 2902.84) - 1621.00) * 0.09
  if (base > 2902.84) inss += (Math.min(base, 4354.27) - 2902.84) * 0.12
  if (base > 4354.27) inss += (Math.min(base, teto)    - 4354.27) * 0.14

  return inss
}

// ═══════════════════════════════════════════════════════
// IRPF 2026 — Lei nº 15.270/2025
// Tabela progressiva mensal (igual a 2025, com faixa atualizada)
// + Redutor: isenção até R$ 5.000 | redução gradual até R$ 7.350
//
// Faixa 1: até R$ 2.428,80          → isento
// Faixa 2: R$ 2.428,81 a R$ 2.826,65 → 7,5%  - R$ 182,16
// Faixa 3: R$ 2.826,66 a R$ 3.751,05 → 15%   - R$ 394,16
// Faixa 4: R$ 3.751,06 a R$ 4.664,68 → 22,5% - R$ 675,49
// Faixa 5: acima de R$ 4.664,68      → 27,5% - R$ 908,73
//
// Redutor (Lei 15.270/2025):
//   base ≤ R$ 5.000,00 → redutor = R$ 312,89  (zera o IR até R$ 5k)
//   R$ 5.000,01 a R$ 7.350,00 → redutor = R$ 978,62 − (0,133145 × base)
//   acima de R$ 7.350,00 → sem redutor
// ═══════════════════════════════════════════════════════
function calcularIR(baseCalculo) {
  // 1) Tabela progressiva
  let imposto = 0
  if      (baseCalculo <= 2428.80) imposto = 0
  else if (baseCalculo <= 2826.65) imposto = baseCalculo * 0.075  - 182.16
  else if (baseCalculo <= 3751.05) imposto = baseCalculo * 0.15   - 394.16
  else if (baseCalculo <= 4664.68) imposto = baseCalculo * 0.225  - 675.49
  else                             imposto = baseCalculo * 0.275  - 908.73

  // 2) Redutor (isenção e redução gradual)
  let redutor = 0
  if      (baseCalculo <= 5000.00) redutor = 312.89
  else if (baseCalculo <= 7350.00) redutor = 978.62 - (0.133145 * baseCalculo)

  return Math.max(0, imposto - redutor)
}

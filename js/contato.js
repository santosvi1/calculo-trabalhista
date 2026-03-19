document.querySelector("#form-contato").addEventListener("submit", async(e) =>{
    e.preventDefault();

    const nome = document.querySelector("#nome").value.trim();
    const email = document.querySelector("#email").value.trim();
    const assunto = document.querySelector("#assunto").value;
    const mensagem = document.querySelector("#mensagem").value.trim()

    if(!nome || !email || !assunto || !mensagem){
        alert("Preencha todos os campos")
        return
    }

    const response = await fetch('https://formspree.io/f/myknooaw', {
        method:"POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({nome, email, assunto, mensagem})
    })

    if (response.ok){
        alert("Mensagem Enviada")
    }
})
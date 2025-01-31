import { salvarDescoberta, getDescobertas } from './db.js';

//registrando a service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            let reg;
            reg = await navigator.serviceWorker.register('/sw.js', { type: "module" });

            console.log('Service worker registrada! 😎', reg);
            postNews();
        } catch (err) {
            console.log('😥 Service worker registro falhou: ', err);
        }
    });
}

let constraints = { video: { facingMode: "user" }, audio: false };

const cameraView = document.getElementById("camera--view"),
    cameraOutput = document.getElementById("camera--output"),
    cameraSensor = document.getElementById("camera--sensor"),
    cameraTrigger = document.getElementById("camera--trigger");


function cameraStart() {
    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function (stream) {
            cameraView.srcObject = stream;
        })
        .catch(function (error) {
            console.error("Ocorreu um erro.", error);
        });
}

const capturarLocalizacao = document.getElementById('localizacao');
const latitude = document.getElementById('latitude');
const longitude = document.getElementById('longitude');
const mapa = document.getElementById('mapa');



function sucesso(posicao) {
    latitude.textContent = posicao.coords.latitude;
    longitude.textContent = posicao.coords.longitude;
    mapa.src = `https://www.google.com/maps?q=${posicao.coords.latitude},${posicao.coords.longitude}&zoom=15&output=embed`;
}

const erro = (error) => {
    let errorMessage;
    switch (error.code) {
        case 0:
            errorMessage = 'Erro desconhecido';
            break;
        case 1:
            errorMessage = 'Permissão negada!';
            break;
        case 2:
            errorMessage = 'Captura de posição indisponível!';
            break;
        case 3:
            errorMessage = 'Tempo de solicitação excedido!';
            break;
    }
    console.log('Ocorreu um erro: ', errorMessage);
};

capturarLocalizacao.addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(sucesso, erro);
});


// 📌 Captura de Foto e Registro no IndexedDB
cameraTrigger.addEventListener("click", async () => {
    const nomeDescoberta = document.getElementById("nomeDescoberta").value;

    cameraSensor.width = cameraView.videoWidth;
    cameraSensor.height = cameraView.videoHeight;
    cameraSensor.getContext("2d").drawImage(cameraView, 0, 0);
    const foto = cameraSensor.toDataURL("image/webp");
    cameraOutput.classList.add("taken");

    navigator.geolocation.getCurrentPosition(async (posicao) => {
        await salvarDescoberta(nomeDescoberta, foto, posicao.coords.latitude, posicao.coords.longitude);
        carregarDescobertas();
    }, erro);
});

// 📌 Carregar Descobertas no Histórico
async function carregarDescobertas() {
    const listaDescobertas = document.getElementById("listaDescobertas");
    listaDescobertas.innerHTML = "";

    const descobertas = await getDescobertas();

    descobertas.forEach((descoberta) => {
        const item = document.createElement("li");
        item.innerHTML = `<strong>${descoberta.nome}</strong><br>
                          <img src="${descoberta.foto}" width="200" /><br>
                          Localização: (${descoberta.latitude}, ${descoberta.longitude})`;
        listaDescobertas.appendChild(item);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    cameraStart();
    carregarDescobertas();
});

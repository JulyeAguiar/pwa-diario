import { openDB } from "idb";

let db;

// 📌 Criando/Abrindo o Banco de Dados
async function createDB() {
    db = await openDB('descobertasDB', 1, {
        upgrade(db, oldVersion) {
            if (oldVersion < 1) {
                const store = db.createObjectStore('descobertas', {
                    keyPath: 'id',
                    autoIncrement: true
                });
                store.createIndex('nome', 'nome');
                store.createIndex('latitude', 'latitude');
                store.createIndex('longitude', 'longitude');
                store.createIndex('foto', 'foto');
                console.log("Banco de dados criado!");
            }
        }
    });
    console.log("Banco de dados aberto");
}

// 📌 Salvando uma Descoberta no IndexedDB
async function salvarDescoberta(nome, foto, latitude, longitude) {
    if (!db) await createDB();
    const tx = db.transaction('descobertas', 'readwrite');
    const store = tx.objectStore('descobertas');
    await store.add({ nome, foto, latitude, longitude });
    await tx.done;
    console.log("Descoberta salva:", nome);
}

// Listando Todas as Descobertas
async function getDescobertas() {
    if (!db) await createDB();
    const tx = db.transaction('descobertas', 'readonly');
    const store = tx.objectStore('descobertas');
    return await store.getAll();
}

// Inicializa o banco de dados ao carregar a página
window.addEventListener("DOMContentLoaded", async () => {
    await createDB();
});

export { salvarDescoberta, getDescobertas };

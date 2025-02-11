// Elementos HTML
const audio = document.getElementById("audio");
const title = document.getElementById("title");
const artist = document.getElementById("artist");
const cover = document.getElementById("cover");
const background = document.querySelector(".background");
const progressBar = document.getElementById("progress-bar");
const progress = document.getElementById("progress");
const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const shuffleBtn = document.getElementById("shuffle");
const repeatBtn = document.getElementById("repeat");
const fileInput = document.getElementById("file-input");
const playlist = document.getElementById("playlist");
const toggleListBtn = document.getElementById("toggle-list-btn"); // Botão de alternar lista
const musicListContainer = document.getElementById("music-list-container"); // Contêiner da lista de músicas

// Variáveis de controle
let songs = JSON.parse(localStorage.getItem("songs")) || []; // Carregar músicas do localStorage
let currentSongIndex = 0;
let isShuffle = false;
let isRepeat = false;

// Atualiza a interface para a música atual
function loadSong(song) {
  const defaultCover = "/mídias /img2.0/dde73b3c9a62f7b9b8788a47a0fcca31.jpg";
  title.textContent = song.title || "Título desconhecido";
  artist.textContent = song.artist || "Artista desconhecido";
  audio.src = song.src;
  cover.src = song.cover || defaultCover;
  background.style.backgroundImage = `url(${song.cover || defaultCover})`;

  // Atualiza a lista de músicas para destacar a música atual
  updateMusicList();
}

// Atualiza a lista de músicas no painel
function updateMusicList() {
  musicListContainer.innerHTML = ""; // Limpa a lista atual

  songs.forEach((song, index) => {
    const item = document.createElement("div");
    item.classList.add("music-list-item");
    item.textContent = `${song.title || "Música Desconhecida"} - ${song.artist || "Artista Desconhecido"}`;

    // Destaca a música atual
    if (index === currentSongIndex) {
      item.classList.add("active");
    }

    // Define a ação ao clicar em uma música
    item.addEventListener("click", () => {
      currentSongIndex = index;
      loadSong(songs[currentSongIndex]);
      playSong();
    });

    musicListContainer.appendChild(item);
  });
}

// Alterna a visibilidade da lista de músicas
function toggleMusicList() {
  musicListContainer.classList.toggle("visible");
}

// Inicia a reprodução da música
function playSong() {
  audio.play();
  playBtn.querySelector("img").src = "/mídias /img /pausa (1).png ";
}

// Pausa a reprodução da música
function pauseSong() {
  audio.pause();
  playBtn.querySelector("img").src = "/mídias /img /botao-play-ponta-de-seta.png";
}

// Alterna entre tocar e pausar
function togglePlay() {
  if (audio.paused) {
    playSong();
  } else {
    pauseSong();
  }
}

// Carrega a próxima música
function nextSong() {
  if (isShuffle) {
    playRandomSong();
  } else {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(songs[currentSongIndex]);
    playSong();
  }
}

// Carrega a música anterior
function prevSong() {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  loadSong(songs[currentSongIndex]);
  playSong();
}

// Reproduz uma música aleatória
function playRandomSong() {
  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * songs.length);
  } while (randomIndex === currentSongIndex && songs.length > 1);
  currentSongIndex = randomIndex;
  loadSong(songs[currentSongIndex]);
  playSong();
}

// Ativa/desativa o modo aleatório
function toggleShuffle() {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle("active", isShuffle);
}

// Ativa/desativa o modo de repetição
function toggleRepeat() {
  isRepeat = !isRepeat;
  repeatBtn.classList.toggle("active", isRepeat);
}

// Atualiza o progresso da barra
function updateProgress() {
  const progressPercent = (audio.currentTime / audio.duration) * 100;
  progress.style.width = `${progressPercent}%`;
}

// Define o progresso com base no clique
function setProgress(e) {
  const width = progressBar.clientWidth;
  const clickX = e.offsetX;
  const duration = audio.duration;
  audio.currentTime = (clickX / width) * duration;
}

// Adiciona uma música à lista de reprodução
function addToPlaylist(song, index) {
  const item = document.createElement("div");
  item.classList.add("playlist-item");
  item.textContent = `${song.title || "Música Desconhecida"} - ${song.artist || "Artista Desconhecido"}`;
  item.addEventListener("click", () => {
    currentSongIndex = index;
    loadSong(songs[currentSongIndex]);
    playSong();
  });
  playlist.appendChild(item);
}

// Lida com a seleção de arquivos pelo usuário
function handleFiles(event) {
  const files = event.target.files;

  Array.from(files).forEach((file, index) => {
    const url = URL.createObjectURL(file);
    const song = { title: file.name.split(".")[0], src: url, cover: "/mídias /img2.0/dde73b3c9a62f7b9b8788a47a0fcca31.jpg" };

    jsmediatags.read(file, {
      onSuccess: (tag) => {
        const tags = tag.tags;
        song.title = tags.title || file.name.split(".")[0];
        song.artist = tags.artist || "Artista Desconhecido";
        if (tags.picture) {
          const data = tags.picture.data;
          const format = tags.picture.format;
          const base64String = data.reduce((acc, byte) => acc + String.fromCharCode(byte), "");
          song.cover = `data:${format};base64,${btoa(base64String)}`;
        }
        if (index === 0) loadSong(song); // Carrega a primeira música
      },
      onError: () => {
        console.error("Erro ao carregar metadados.");
        song.cover = "/mídias /img2.0/dde73b3c9a62f7b9b8788a47a0fcca31.jpg"; // Define a capa padrão em caso de erro
      },
    });

    songs.push(song);
    addToPlaylist(song, songs.length - 1);
  });

  // Salva as músicas no localStorage
  localStorage.setItem("songs", JSON.stringify(songs));
}

// Recupera músicas do localStorage ao carregar a página
function loadPlaylistFromStorage() {
  if (songs.length > 0) {
    songs.forEach((song, index) => {
      addToPlaylist(song, index);
      if (index === 0) loadSong(song); // Carrega a primeira música
    });
  }
}

// Eventos
fileInput.addEventListener("change", handleFiles);
playBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", prevSong);
shuffleBtn.addEventListener("click", toggleShuffle);
repeatBtn.addEventListener("click", toggleRepeat);
progressBar.addEventListener("click", setProgress);
audio.addEventListener("timeupdate", updateProgress);
audio.addEventListener("ended", () => {
  if (isRepeat) {
    playSong();
  } else {
    nextSong();
  }
});
toggleListBtn.addEventListener("click", toggleMusicList);

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  loadPlaylistFromStorage(); // Carrega a lista de músicas do localStorage
});  

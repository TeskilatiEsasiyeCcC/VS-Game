// Canvas öğesini seçiyoruz
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Canvas boyutları
canvas.width = 800;
canvas.height = 600;

// Harita seçimini soralım
let mapChoice = prompt("Choose a map: 1 for Flat, 2 for Obstacle") || "1";

// Oyuncu isimlerini ve başlangıç durumlarını soralım
let player1Name = prompt("Player 1, enter your name:") || "Player 1";
let player2Name = prompt("Player 2, enter your name:") || "Player 2";

// Oyuncuların başlangıç pozisyonları
let player1 = { x: 50, y: 300, width: 50, height: 50, color: 'red', speed: 5, score: 0, collectedItems: 0, name: player1Name };
let player2 = { x: 700, y: 300, width: 50, height: 50, color: 'blue', speed: 5, score: 0, collectedItems: 0, name: player2Name };

// Eşyaların başlangıç pozisyonları
let item1 = { x: Math.random() * (canvas.width - 30), y: Math.random() * (canvas.height - 30), width: 30, height: 30, color: 'green' };

// Engeller (yalnızca engelli harita için geçerli)
let obstacles = [];

// Tuş basılı mı kontrolü
const keysPressed = {};

// Resimlerin tanımlanması
const player1Image = new Image();
const player2Image = new Image();

player1Image.src = 'player1.png'; // Oyuncu 1'in resmi
player2Image.src = 'player2.png'; // Oyuncu 2'nin resmi

// Resimler yüklendikten sonra oyunun başlatılmasını bekleyelim
player1Image.onload = function() {
    player2Image.onload = function() {
        gameLoop(); // Resimler yüklendikten sonra oyun döngüsünü başlat
    };
};

// Klavye olaylarını dinle
document.addEventListener('keydown', (e) => keysPressed[e.key] = true);
document.addEventListener('keyup', (e) => keysPressed[e.key] = false);

// Arka plan renk değişimi
let bgColor = { r: 0, g: 0, b: 0 };
let colorChangeSpeed = 5; // Renk değişim hızı

// Süre sayacı
let timeLeft = 60; // 60 saniye
let gameTimer = setInterval(() => {
    if (timeLeft > 0) {
        timeLeft--;
    }
}, 1000); // Her saniyede bir sayacı azalt

// Harita engellerini oluşturma
function createObstacles() {
    obstacles = [
        { x: Math.random() * (canvas.width - 100), y: Math.random() * (canvas.height - 50), width: 100, height: 50, color: 'gray' },
        { x: Math.random() * (canvas.width - 50), y: Math.random() * (canvas.height - 100), width: 50, height: 100, color: 'gray' },
        { x: Math.random() * (canvas.width - 150), y: Math.random() * (canvas.height - 50), width: 150, height: 50, color: 'gray' }
    ];
}

// Eşyayı toplayıp hızlandırma kontrolü
function resetItem() {
    let itemPositionFound = false;

    while (!itemPositionFound) {
        // Eşya her zaman ekranın içinde olacak şekilde pozisyonunu rastgele belirleyelim
        item1.x = Math.random() * (canvas.width - item1.width);
        item1.y = Math.random() * (canvas.height - item1.height);

        // Eğer eşya engellerin içine yerleşmişse, yeni bir pozisyon belirleyelim
        itemPositionFound = true;
        for (let obstacle of obstacles) {
            if (
                item1.x < obstacle.x + obstacle.width &&
                item1.x + item1.width > obstacle.x &&
                item1.y < obstacle.y + obstacle.height &&
                item1.y + item1.height > obstacle.y
            ) {
                itemPositionFound = false; // Eşya engel ile çakıştıysa, yeni bir yer arıyoruz
                break;
            }
        }
    }
}

// Oyun döngüsü
function gameLoop() {
    // Tuşlara göre oyuncu hareketi
    if (keysPressed['w'] && !checkCollisionWithObstacles(player1, 0, -player1.speed)) player1.y = Math.max(0, player1.y - player1.speed);
    if (keysPressed['s'] && !checkCollisionWithObstacles(player1, 0, player1.speed)) player1.y = Math.min(canvas.height - player1.height, player1.y + player1.speed);
    if (keysPressed['a'] && !checkCollisionWithObstacles(player1, -player1.speed, 0)) player1.x = Math.max(0, player1.x - player1.speed);
    if (keysPressed['d'] && !checkCollisionWithObstacles(player1, player1.speed, 0)) player1.x = Math.min(canvas.width - player1.width, player1.x + player1.speed);

    if (keysPressed['ArrowUp'] && !checkCollisionWithObstacles(player2, 0, -player2.speed)) player2.y = Math.max(0, player2.y - player2.speed);
    if (keysPressed['ArrowDown'] && !checkCollisionWithObstacles(player2, 0, player2.speed)) player2.y = Math.min(canvas.height - player2.height, player2.y + player2.speed);
    if (keysPressed['ArrowLeft'] && !checkCollisionWithObstacles(player2, -player2.speed, 0)) player2.x = Math.max(0, player2.x - player2.speed);
    if (keysPressed['ArrowRight'] && !checkCollisionWithObstacles(player2, player2.speed, 0)) player2.x = Math.min(canvas.width - player2.width, player2.x + player2.speed);

    // Eşyayı toplayıp hızlandırma kontrolü
    if (checkCollision(player1, item1)) {
        player1.score++;
        player1.collectedItems++;
        player1.speed += 0.5; // Eşyayı topladığında hız 0.5 artsın
        resetItem(); // Eşyayı yeniden yerleştir
        if (player1.collectedItems >= 10) { // 10 eşya toplandıysa engellerin yerini değiştir
            player1.collectedItems = 0; // Sayacı sıfırla
            createObstacles(); // Engellerin yerini değiştir
        }
    }

    if (checkCollision(player2, item1)) {
        player2.score++;
        player2.collectedItems++;
        player2.speed += 0.5; // Eşyayı topladığında hız 0.5 artsın
        resetItem(); // Eşyayı yeniden yerleştir
        if (player2.collectedItems >= 10) { // 10 eşya toplandıysa engellerin yerini değiştir
            player2.collectedItems = 0; // Sayacı sıfırla
            createObstacles(); // Engellerin yerini değiştir
        }
    }

    // Oyun bitiş kontrolü (süre bittiğinde)
    if (timeLeft <= 0) {
        gameOver();
        clearInterval(gameTimer); // Süre dolduğunda sayacı durdur
        return; // Oyun bittiği için döngü durdurulur
    }

    // Ekranı temizle
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Arka planı RGB olarak hızlıca değiştir
    if (bgColor.r < 255) bgColor.r += colorChangeSpeed;
    if (bgColor.g < 255) bgColor.g += colorChangeSpeed;
    if (bgColor.b < 255) bgColor.b += colorChangeSpeed;

    ctx.fillStyle = `rgb(${bgColor.r}, ${bgColor.g}, ${bgColor.b})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Engelli harita varsa engelleri çiz
    if (mapChoice === "2") {
        drawObstacles();
    }

    // Oyuncuları çiz (resimlerle)
    drawPlayer(player1, player1Image);
    drawPlayer(player2, player2Image);

    // Eşyayı çiz
    drawItem(item1);

    // Skorları göster
    drawScore();

    // Oyunu tekrar başlat
    requestAnimationFrame(gameLoop);
}

// Oyuncuyu çizme fonksiyonu
function drawPlayer(player, image) {
    ctx.drawImage(image, player.x, player.y, player.width, player.height); // Resmi ekliyoruz
}

// Eşyayı çizme fonksiyonu
function drawItem(item) {
    ctx.fillStyle = item.color;
    ctx.fillRect(item.x, item.y, item.width, item.height);
}

// Skorları çizme
function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`${player1.name}: ${player1.score}`, 20, 30);
    ctx.fillText(`${player2.name}: ${player2.score}`, canvas.width - 150, 30);
    ctx.fillText(`Time Left: ${timeLeft}`, canvas.width / 2 - 50, 30);
}

// Çarpışma kontrolü
function checkCollision(player, item) {
    return player.x < item.x + item.width &&
        player.x + player.width > item.x &&
        player.y < item.y + item.height &&
        player.y + player.height > item.y;
}

// Çarpışma engelleriyle
function checkCollisionWithObstacles(player, dx, dy) {
    const newPlayer = { ...player, x: player.x + dx, y: player.y + dy };

    for (let obstacle of obstacles) {
        if (
            newPlayer.x < obstacle.x + obstacle.width &&
            newPlayer.x + newPlayer.width > obstacle.x &&
            newPlayer.y < obstacle.y + obstacle.height &&
            newPlayer.y + newPlayer.height > obstacle.y
        ) {
            return true; // Çarpışma varsa
        }
    }
    return false; // Çarpışma yoksa
}

// Engelleri çizme
function drawObstacles() {
    for (let obstacle of obstacles) {
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
}

// Oyun bitişi
function gameOver() {
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.fillText('Game Over!', canvas.width / 2 - 100, canvas.height / 2);
    ctx.fillText(`${player1.score > player2.score ? player1.name : player2.name} wins!`, canvas.width / 2 - 100, canvas.height / 2 + 50);
}

// Eğer harita 2 seçildiyse engelleri oluştur
if (mapChoice === "2") {
    createObstacles();
}

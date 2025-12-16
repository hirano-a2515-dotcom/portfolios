// ゲームの状態
const CONTINUE = null; // まだ決着がついていない
const WIN_PLAYER_1 = 1; // 〇の勝ち
const WIN_PLAYER_2 = -1; // ✕の勝ち
const DRAW_GAME = 0; // 引き分け

//時間制限の追加
// 💡 時間切れによる敗北も導入するため、これらの定数を活用します
const TIME_OUT_PLAYER_1 = 2; // プレイヤー1が時間切れで敗北 (結果はプレイヤー2の勝ち)
const TIME_OUT_PLAYER_2 = -2; // プレイヤー2が時間切れで敗北 (結果はプレイヤー1の勝ち)

// --- プレイヤーごとの持ち時間の追加 ---
const PLAYER_TIME_LIMIT_SECONDS = 300; // プレイヤーごとの持ち時間（秒、例: 5分）

const cells = [ // 空なら0、〇なら1、✕なら-1
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
]
let turn = 1; // 〇の番なら1、✕の番なら-1
let result = CONTINUE;

// --- プレイヤーごとのタイマー関連の変数 ---
let timerIntervalId = null;
let player1TimeLeftSeconds = PLAYER_TIME_LIMIT_SECONDS; // 〇の残り時間
let player2TimeLeftSeconds = PLAYER_TIME_LIMIT_SECONDS; // ✕の残り時間

// --- タイマー表示を更新する関数 ---
function updateTimerDisplay(player, timeLeft) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timerElementId = player === 1 ? "#player1_timer" : "#player2_timer";
    const prefix = player === 1 ? "〇の残り時間: " : "●の残り時間: ";
    const timerElement = document.querySelector(timerElementId);

    if (timerElement) {
        timerElement.textContent = `${prefix}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // 残り時間が少ない場合に色を変えるなどの処理
        if (timeLeft <= 30) {
             timerElement.style.color = 'red';
        } else {
             timerElement.style.color = '';
        }
    }
}

// --- ターンに合わせてタイマーを切り替える関数 ---
function startTimer() {
    // 既存のタイマーがあれば停止
    if (timerIntervalId !== null) {
        clearInterval(timerIntervalId);
    }
    
    // 初回表示を更新
    updateTimerDisplay(1, player1TimeLeftSeconds);
    updateTimerDisplay(-1, player2TimeLeftSeconds);

    // 1秒ごとにタイマーを更新
    timerIntervalId = setInterval(() => {
        // ゲームが既に終了している場合はタイマーを停止
        if (result !== CONTINUE) {
             clearInterval(timerIntervalId);
             timerIntervalId = null;
             return;
        }
        
        // 現在のターンのプレイヤーの時間を減らす
        if (turn === 1) {
            // プレイヤー1のターン
            if (player1TimeLeftSeconds > 0) {
                player1TimeLeftSeconds--;
                updateTimerDisplay(1, player1TimeLeftSeconds);
                
                if (player1TimeLeftSeconds === 0) {
                    // 〇が時間切れ
                    result = TIME_OUT_PLAYER_1; 
                    check();
                }
            }
        } else {
            // プレイヤー2のターン
            if (player2TimeLeftSeconds > 0) {
                player2TimeLeftSeconds--;
                updateTimerDisplay(-1, player2TimeLeftSeconds);
                
                if (player2TimeLeftSeconds === 0) {
                    // ✕が時間切れ
                    result = TIME_OUT_PLAYER_2;
                    check();
                }
            }
        }
    }, 1000);
}

// セルをクリックしたときのイベントを登録
for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
        const cell = document.querySelector(`#cell_${row}_${col}`);
        cell.addEventListener("click", () => {
            if (result !== CONTINUE) {
                window.location.reload(true); // 決着がついた後にクリックしたらリロード
            }

            //　ターンを渡す前に、現在のターンを保存したおく
            const currentTurn = turn;

            if (cells[row][col] === 0) { // 置けるかどうかの判定
                putMark(row, col); // ○か×を置く
                reverseMarks(row, col, currentTurn);//挟みこみを判定
                //turn = turn * -1;
                check(); // ゲームの状態を確認

                // 勝敗が決まっていなければターンを切り替える
                if (result === CONTINUE) {
                    turn = turn * -1;
                }
                // ターンが切り替わったのでタイマーも再起動（実際は同じIDだが、現在のturnに基づいて動作する）
                startTimer();
            }
        });
    }
}

// ○か×を置く
function putMark(row, col) {
    
    const cell = document.querySelector(`#cell_${row}_${col}`);
    if (turn === 1) {
        cell.textContent = "〇";
        cell.classList.add("o");
        cells[row][col] = 1;
    } else {
        cell.textContent = "●";
        cell.classList.add("x");
        cells[row][col] = -1;
    }
}

/* 置いたマークによって挟まれた相手のマークを反転させる
*@param {Number} row - 置いたセルの行
*@param {number} col - 置いたセルの列
*@param {number} currentTurn - 現在置いた石の値　（１　または　ー１）
*/

function reverseMarks(row, col, currentTurn) {
    const SIZE = 6;
    // 8方向の定義: [dRow, dCol]
    const directions = [
        [0, 1], [0, -1],   // 水平
        [1, 0], [-1, 0],   // 垂直
        [1, 1], [1, -1],   // 斜め (右下がり、左下がり)
        [-1, 1], [-1, -1]  // 斜め (右上がり、左上がり)
    ];

    // 挟まれた石を格納する配列
    const reversedCells = [];

    // 8方向をチェック
    for (const [dRow, dCol] of directions) {
        let r = row + dRow;
        let c = col + dCol;
        const potentialReverses = []; // この方向で反転候補のセル

        // 盤面の範囲内でチェックを続ける
        while (r >= 0 && r < SIZE && c >= 0 && c < SIZE) {
            const cellValue = cells[r][c];

            if (cellValue === 0) {
                // 空のセルに到達したら、挟み込みは成立しない
                potentialReverses.length = 0; // 候補をクリア
                break;
            }

            if (cellValue === currentTurn * -1) {
                // 相手の石（反転候補）を見つけた
                potentialReverses.push({ r, c });
            } 
            
            if (cellValue === currentTurn) {
                // 自分の石（挟み込み成立）を見つけた
                if (potentialReverses.length > 0) {
                    // 挟み込みが成立したので、候補を確定リストに追加
                    reversedCells.push(...potentialReverses);
                }
                // この方向のチェックは終了
                break;
            }
            
            // 次のセルへ
            r += dRow;
            c += dCol;
        }
    }
    
    // 確定した石を反転させる
    for (const { r, c } of reversedCells) {
        cells[r][c] = currentTurn; // データの更新
        
        // UIの更新
        const cell = document.querySelector(`#cell_${r}_${c}`);
        cell.textContent = currentTurn === 1 ? "〇" : "●";
        cell.classList.remove(currentTurn === 1 ? "x" : "o"); // 相手のクラスを削除
        cell.classList.add(currentTurn === 1 ? "o" : "x");    // 自分のクラスを追加
    }
    
    // オセロでは、石を置いた後に一つも反転できなかった場合、置けずにパス（ターン継続）になるが、
    // 今回は「置けるかどうかの判定」を簡略化するため、反転の有無に関わらずターンを渡す仕様とする。
}


// ゲームの状態を確認
/*function check() {
    result = judge(cells);
    const message = document.querySelector("#message");
    switch (result) {
        case WIN_PLAYER_1:
            message.textContent = "〇の勝ち!";
            break;
        case WIN_PLAYER_2:
            message.textContent = "●の勝ち!";
            break;
        case DRAW_GAME:
            message.textContent = "引き分け!";
            break;
    }
}*/
function check() {
    // 既存の勝利判定と、時間切れ判定を統合
    if (result === CONTINUE) {
        // 通常の勝敗判定
        result = judge(cells);
    }
    
    const message = document.querySelector("#message");

    if (result !== CONTINUE) {
        // 決着がついたらタイマーを停止
        if (timerIntervalId !== null) {
            clearInterval(timerIntervalId);
            timerIntervalId = null;
        }
        
        // 結果メッセージの表示
        switch (result) {
            case WIN_PLAYER_1:
                message.textContent = "〇の勝ち!";
                break;
            case WIN_PLAYER_2:
                message.textContent = "●の勝ち!";
                break;
            case DRAW_GAME:
                message.textContent = "引き分け!";
                break;
            // 時間切れによる結果を追加
            case TIME_OUT_PLAYER_1:
                message.textContent = "〇が時間切れ！ ●の勝ちです。";
                break;
            case TIME_OUT_PLAYER_2:
                message.textContent = "●が時間切れ！ 〇の勝ちです。";
                break;
        }
    }
}

// 勝敗を判定する処理
/*function judge(_cells) {
    // 調べる必要があるラインをリストアップ
    const lines = [
        // 横をチェック
        [_cells[0][0], _cells[0][1], _cells[0][2], _cells[0][3], _cells[0][4], _cells[0][5]],
        [_cells[1][0], _cells[1][1], _cells[1][2], _cells[1][3], _cells[1][4], _cells[1][5]],
        [_cells[2][0], _cells[2][1], _cells[2][2], _cells[2][3], _cells[2][4], _cells[2][5]],
        [_cells[3][0], _cells[3][1], _cells[3][2], _cells[3][3], _cells[3][4], _cells[3][5]],
        [_cells[4][0], _cells[4][1], _cells[4][2], _cells[4][3], _cells[4][4], _cells[4][5]],
        [_cells[5][0], _cells[5][1], _cells[5][2], _cells[5][3], _cells[5][4], _cells[5][5]],
        // 縦をチェック
        [_cells[0][0], _cells[1][0], _cells[2][0], _cells[3][0], _cells[4][0], _cells[5][0]],
        [_cells[0][1], _cells[1][1], _cells[2][1], _cells[3][1], _cells[4][1], _cells[5][1]],
        [_cells[0][2], _cells[1][2], _cells[2][2], _cells[3][2], _cells[4][2], _cells[5][2]],
        [_cells[0][3], _cells[1][3], _cells[2][3], _cells[3][3], _cells[4][3], _cells[5][3]],
        [_cells[0][4], _cells[1][4], _cells[2][4], _cells[3][4], _cells[4][4], _cells[5][4]],
        [_cells[0][5], _cells[1][5], _cells[2][5], _cells[3][5], _cells[4][5], _cells[5][5]],
        // 斜めをチェック
        [_cells[0][0], _cells[1][1], _cells[2][2], _cells[3][3], _cells[4][4], _cells[5][5]],
        [_cells[0][5], _cells[1][4], _cells[2][3], _cells[3][2], _cells[4][1], _cells[5][0]],
        [_cells[0][1], _cells[1][2], _cells[2][3], _cells[3][4], _cells[4][5]],
        [_cells[1][5], _cells[2][4], _cells[3][3], _cells[4][2], _cells[5][1]],
        [_cells[1][5], _cells[2][4], _cells[3][3], _cells[4][2], _cells[5][1]],
        [_cells[1][5], _cells[2][4], _cells[3][3], _cells[4][2], _cells[5][1]],
    ];
    // 勝ち負けチェック
    for (let line of lines) {
        const sum = line[0] + line[1] + line[2] + line[3] + line[4] + line[5];
        if (sum === 5) {
            return WIN_PLAYER_1;
        }
        if (sum === -5) {
            return WIN_PLAYER_2;
        }
    }
    // 継続チェック
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 6; col++) {
            if (_cells[row][col] === 0) {
                return CONTINUE;
            }
        }
    }
    return DRAW_GAME;
}*/
const WIN_COUNT = 5; // 勝利に必要な連続数

function judge(_cells) {
    const SIZE = 6;
    
    // --- 勝利判定ヘルパー関数 ---
    // line配列（セルの値のリスト）にWIN_COUNTの連続があるかチェック
    function checkLine(line) {
        for (let i = 0; i <= line.length - WIN_COUNT; i++) {
            let sum = 0;
            for (let j = 0; j < WIN_COUNT; j++) {
                sum += line[i + j];
            }
            if (sum === WIN_COUNT) {
                return WIN_PLAYER_1; // P1の勝利 (1 * 5 = 5)
            }
            if (sum === -WIN_COUNT) {
                return WIN_PLAYER_2; // P2の勝利 (-1 * 5 = -5)
            }
        }
        return null;
    }
    
    // --- 1. 横と縦をチェック ---
    for (let i = 0; i < SIZE; i++) {
        // 横ラインのチェック
        const horizontalLine = _cells[i];
        let result = checkLine(horizontalLine);
        if (result) return result;

        // 縦ラインのチェック
        const verticalLine = [];
        for (let j = 0; j < SIZE; j++) {
            verticalLine.push(_cells[j][i]);
        }
        result = checkLine(verticalLine);
        if (result) return result;
    }

    // --- 2. 斜めをチェック (左上から右下) ---
    // メインの斜めとその周辺の5個以上並びのライン
    for (let i = -(SIZE - WIN_COUNT); i <= (SIZE - WIN_COUNT); i++) {
        const line = [];
        for (let j = 0; j < SIZE; j++) {
            let col = j + i;
            if (col >= 0 && col < SIZE) {
                line.push(_cells[j][col]);
            }
        }
        // ラインの長さがWIN_COUNT以上の場合のみチェック
        if (line.length >= WIN_COUNT) {
            let result = checkLine(line);
            if (result) return result;
        }
    }

    // --- 3. 斜めをチェック (右上から左下) ---
    for (let i = WIN_COUNT - 1; i <= 2 * SIZE - WIN_COUNT; i++) {
        const line = [];
        for (let j = 0; j < SIZE; j++) {
            let col = i - j;
            if (col >= 0 && col < SIZE) {
                line.push(_cells[j][col]);
            }
        }
        if (line.length >= WIN_COUNT) {
            let result = checkLine(line);
            if (result) return result;
        }
    }

    // --- 4. 継続チェック ---
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            if (_cells[row][col] === 0) {
                return CONTINUE;
            }
        }
    }
    
    // --- 5. 引き分け ---
    return DRAW_GAME;
}
// ページロード時にタイマーを開始
startTimer();
//AIに考えてもらう
function thinkAI() {
    
}
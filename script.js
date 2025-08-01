// =================================================================
// script.js
// タイトル画面『最後の言葉』の、演出と、画面遷移を、担当
// =================================================================

document.addEventListener('DOMContentLoaded', (event) => {

    // 要素を取得
    const laptopContainer = document.getElementById('laptop-container');
    const titleLogo = document.getElementById('title-logo');
    const audio = new Audio('sounds/click.mp3');

    // ミュート状態で、自動再生を開始
    audio.muted = true;
    
    // 不規則なクリック音を再生する関数
    function playRandomClick() {
        // 音を再生
        audio.currentTime = 0;
        audio.play().catch(error => {
            console.log("Audio playback was initiated but might be blocked by browser policy until user interaction.", error);
        });

        // 音と同期して、ロゴを光らせる
        titleLogo.classList.add('is-clicking');
        setTimeout(() => {
            titleLogo.classList.remove('is-clicking');
        }, 200);

        // 次のクリックまでの時間をランダムに設定
        const nextClickTime = Math.random() * 10000 + 3000;
        setTimeout(playRandomClick, nextClickTime);
    }

    // ページが読み込まれたら、すぐに、(ミュート状態で)再生ループを開始
    playRandomClick();

    // 最初のクリックで、ミュートを解除する関数
    function unmuteAudioOnFirstInteraction() {
        if (audio.muted) {
            audio.muted = false;
        }
        // このイベントリスナーは一度だけで良いので削除
        document.body.removeEventListener('click', unmuteAudioOnFirstInteraction);
        document.body.removeEventListener('keydown', unmuteAudioOnFirstInteraction);
    }

    // クリックまたはキー入力で、ミュートを解除する
    document.body.addEventListener('click', unmuteAudioOnFirstInteraction);
    document.body.addEventListener('keydown', unmuteAudioOnFirstInteraction);

    // ラップトップがクリックされた時の処理
    laptopContainer.addEventListener('click', () => {
        console.log("ゲームを開始します..."); 

        // 画面全体をフェードアウト
        document.body.style.transition = 'opacity 1.5s';
        document.body.style.opacity = '0';
        
        // フェードアウト後に、ゲーム画面へ遷移
        setTimeout(() => {
            window.location.href = "game.html"; // ここで、game.htmlへ、ページ遷移
        }, 1500);
    });
});
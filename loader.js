// =============================
// 🔥 PRO LOADER SYSTEM v3
// =============================

(function () {

    const loader      = document.getElementById("loader");
    const progressBar = document.getElementById("progressBar");
    const percentText = document.getElementById("percent");

    if (!loader || !progressBar || !percentText) return;

    // ══════════════════════════════════════════
    // ① แสดง loader ทันทีก่อนอะไรทั้งนั้น
    // ══════════════════════════════════════════
    loader.style.opacity        = "1";
    loader.style.pointerEvents  = "all";
    progressBar.style.width     = "0%";
    percentText.innerText       = "0%";

    // ══════════════════════════════════════════
    // Core: วิ่ง progress จาก 0 → target ใน duration ms
    // แล้วเรียก onDone()
    // ══════════════════════════════════════════
    function runProgress(duration, targetPct, onDone) {
        const startTime = Date.now();
        let current     = parseFloat(progressBar.style.width) || 0;

        // ล้าง transition ของ CSS ให้ JS ควบคุมเอง
        progressBar.style.transition = "none";

        const tick = setInterval(() => {
            const elapsed  = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1); // 0–1

            // easeOut curve ให้ดูเป็นธรรมชาติ
            const eased = 1 - Math.pow(1 - progress, 2);
            current     = eased * targetPct;

            progressBar.style.width = current + "%";
            percentText.innerText   = Math.floor(current) + "%";

            if (progress >= 1) {
                clearInterval(tick);
                if (typeof onDone === "function") onDone();
            }
        }, 16); // ~60fps

        return tick;
    }

    // ══════════════════════════════════════════
    // ซ่อน loader หลังจาก progress ถึง 100%
    // ══════════════════════════════════════════
    function finishAndHide(onHidden) {
        progressBar.style.transition = "width 0.3s ease";
        progressBar.style.width      = "100%";
        percentText.innerText        = "100%";

        setTimeout(() => {
            loader.style.transition = "opacity 0.35s ease";
            loader.style.opacity    = "0";

            setTimeout(() => {
                loader.style.pointerEvents = "none";
                loader.style.transition    = "";
                progressBar.style.width    = "0%";
                percentText.innerText      = "0%";
                if (typeof onHidden === "function") onHidden();
            }, 350);
        }, 200);
    }

    // ══════════════════════════════════════════
    // แสดง loader (ใช้ตอน internal หรือ navigate)
    // ══════════════════════════════════════════
    function showLoader() {
        loader.style.transition    = "opacity 0.2s ease";
        loader.style.opacity       = "1";
        loader.style.pointerEvents = "all";
        progressBar.style.width    = "0%";
        percentText.innerText      = "0%";
    }

    // ══════════════════════════════════════════
    // ① PAGE LOAD — วิ่งขั้นต่ำ 2 วิ แล้วรอ window.load
    // ══════════════════════════════════════════
    let pageLoaded    = false;
    let progressDone  = false;

    // วิ่ง 0→88% ใน 1800ms
    runProgress(1800, 88, () => {
        progressDone = true;
        if (pageLoaded) finishAndHide();
        // ถ้า page ยังโหลดไม่เสร็จ ให้รอ (progress หยุดที่ 88%)
    });

    window.addEventListener("load", () => {
        pageLoaded = true;
        if (progressDone) {
            finishAndHide();
        } else {
            // page โหลดเร็วกว่า animation → รอให้ progress จบก่อน
            // (ไม่ต้องทำอะไร interval จะ finishAndHide เอง)
        }
    });

    // Safety ป้องกัน stuck
    setTimeout(() => {
        if (loader.style.opacity !== "0") finishAndHide();
    }, 8000);

    // ══════════════════════════════════════════
    // ② navigate(url) — เปลี่ยนหน้า .html จริง
    // ★ เปลี่ยนหน้าขณะที่ loader ยังโชว์อยู่
    //   ป้องกัน flash ของหน้าเดิม
    // ══════════════════════════════════════════
    window.navigate = function (url) {
        if (!url) return;
        if (url.startsWith("http") || url.startsWith("#") || url.startsWith("javascript")) {
            window.location.href = url;
            return;
        }

        showLoader();
        // วิ่ง 0→100% ใน 1800ms แล้วค่อยเปลี่ยนหน้า
        // (หน้าใหม่จะโหลด loader ของตัวเองต่อ)
        runProgress(1800, 100, () => {
            progressBar.style.width = "100%";
            percentText.innerText   = "100%";
            // เปลี่ยนหน้าขณะ loader ยังขึ้นอยู่ → ไม่มี flash
            setTimeout(() => {
                window.location.href = url;
            }, 100);
        });
    };

    // ══════════════════════════════════════════
    // ③ showInternalLoader(callback)
    // ใช้กับ SPA transition (ไม่เปลี่ยน URL จริง)
    // เช่น: เข้า Projects, เข้า Canvas
    // ★ callback ถูกเรียกขณะ loader ยังขึ้นอยู่
    //   แล้วค่อย fade loader ออก
    // ══════════════════════════════════════════
    window.showInternalLoader = function (callback) {
        showLoader();
        // วิ่งเร็ว 0→100% ใน 600ms
        runProgress(600, 100, () => {
            progressBar.style.width = "100%";
            percentText.innerText   = "100%";
            // เรียก callback (เปลี่ยน DOM) ขณะ loader ยังขึ้น
            if (typeof callback === "function") callback();
            // ค่อย fade loader ออกหลัง DOM เปลี่ยนแล้ว
            setTimeout(() => finishAndHide(), 150);
        });
    };

    // ══════════════════════════════════════════
    // ④ ดัก <a href="*.html">
    // ══════════════════════════════════════════
    document.addEventListener("click", function (e) {
        const link = e.target.closest("a[href]");
        if (!link) return;
        const href = link.getAttribute("href");
        if (!href || href.startsWith("#") || href.startsWith("javascript") || href.startsWith("http")) return;
        if (href.includes(".html")) {
            e.preventDefault();
            window.navigate(href);
        }
    });

})();

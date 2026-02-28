export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { projectId, content, images = [] } = req.body;

if (!projectId || !content) {
    return res.status(400).json({ message: "Missing projectId or content" });
}

  const repo = "ikuymark2490-coder/my-project-storage";
  const filePath = `data/${projectId}.html`;
  const apiUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;

  try {
    // 1️⃣ เช็คว่าไฟล์มีอยู่ไหม
    const checkFile = await fetch(apiUrl, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    });

    let sha = null;

    if (checkFile.status === 200) {
      const existingFile = await checkFile.json();
      sha = existingFile.sha;
    }

    // 2️⃣ สร้างหรือเขียนทับ
    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "save project data",
        content: Buffer.from(content).toString("base64"),
        sha: sha || undefined,
      }),
    });

    const data = await response.json();

    // อัพโหลดรูปแต่ละไฟล์ไปใน images/
for (const img of images) {
    const imgPath = `data/images/${img.fileName}`;
    const imgApiUrl = `https://api.github.com/repos/${repo}/contents/${imgPath}`;
    
    // เช็คว่ามีไฟล์อยู่แล้วไหม
    const checkImg = await fetch(imgApiUrl, {
        headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` }
    });
    let imgSha = null;
    if (checkImg.status === 200) {
        const existing = await checkImg.json();
        imgSha = existing.sha;
    }
    
    await fetch(imgApiUrl, {
        method: 'PUT',
        headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: `upload image ${img.fileName}`,
            content: img.base64,
            sha: imgSha || undefined
        })
    });
}

return res.status(200).json({
    success: true,
    url: `https://ikuymark2490-coder.github.io/my-project-storage/data/${projectId}.html`
});

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
    }

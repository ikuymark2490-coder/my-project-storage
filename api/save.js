export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { projectId, content } = req.body;

  if (!projectId || !content) {
    return res.status(400).json({ message: "Missing projectId or content" });
  }

  const repo = "ikuymark2490-coder/my-project-storage";
  const filePath = `data/${projectId}.json`;
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

    return res.status(200).json({
      success: true,
      url: data.content.html_url,
      raw: data.content.download_url,
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { content } = req.body;
  const token = process.env.GITHUB_TOKEN;
  const url = "https://api.github.com/repos/ikuymark2490-coder/my-project-storage/contents/data/data.json";

  // 1️⃣ เช็คไฟล์ก่อน
  const getFile = await fetch(url, {
    headers: {
      Authorization: `token ${token}`,
    },
  });

  let sha = null;

  if (getFile.status === 200) {
    const fileData = await getFile.json();
    sha = fileData.sha;
  }

  // 2️⃣ สร้างหรือเขียนทับ
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "update data",
      content: Buffer.from(content).toString("base64"),
      sha: sha || undefined,
    }),
  });

  const data = await response.json();
  res.status(200).json(data);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { content } = req.body;

  const response = await fetch(
    "https://api.github.com/repos/ikuymark2490-coder/my-project-storage/contents/data/data.json",
    {
      method: "PUT",
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "update data",
        content: Buffer.from(content).toString("base64"),
      }),
    }
  );

  const data = await response.json();
  res.status(200).json(data);
}

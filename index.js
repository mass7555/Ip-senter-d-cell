// Aapke charon servers ki list
const SERVERS = [
  "https://mohd-an78-yt-api.hf.space/extract",
  "https://mttc78-yt-impore.hf.space/extract",
  "https://yt-api-ii4k.onrender.com/extract",
  "https://fvd-api.onrender.com/extract"
];

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const videoLink = url.searchParams.get("url");

    // Agar URL nahi diya toh error dikhao
    if (!videoLink) {
      return new Response(JSON.stringify({ error: "No URL provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    const startTime = Date.now();
    const timeoutLimit = 90000; // 1.5 Minutes timeout

    while (Date.now() - startTime < timeoutLimit) {
      for (let server of SERVERS) {
        try {
          const fetchUrl = `${server}?url=${encodeURIComponent(videoLink)}`;
          const response = await fetch(fetchUrl, { method: 'GET' });
          
          if (response.status === 200) {
            const data = await response.json();
            if (data.status === "success") {
              return new Response(JSON.stringify(data), {
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
              });
            }
          }
        } catch (err) {
          console.log("Checking next server...");
        }
        // Servers ke beech gap
        await new Promise(r => setTimeout(r, 1500));
      }
    }

    return new Response(JSON.stringify({ error: "All servers busy" }), {
      status: 504,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
};
    

// Aapke charon servers ki list (Normal Routing ke liye)
const SERVERS = [
  "https://mohd-an78-yt-api.hf.space/extract",
  "https://mttc78-yt-impore.hf.space/extract",
  "https://yt-api-ii4k.onrender.com/extract",
  "https://fvd-api.onrender.com/extract"
];

// Naya Dedicated Routing Logic (Tags map)
const SERVER_MAP = {
  "#90": "https://mohd-an78-yt-api.hf.space/extract",
  "#80": "https://mttc78-yt-impore.hf.space/extract",
  "#85": "https://yt-api-ii4k.onrender.com/extract",
  "#95": "https://fvd-api.onrender.com/extract"
};

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

    // Default settings: Sabhi servers use karo
    let targetServers = SERVERS; 
    let finalVideoLink = videoLink; 

    // TAG CHECKING LOGIC
    // Check karo ki link ke end mein #90, #80 jaisa koi tag toh nahi hai
    for (const tag in SERVER_MAP) {
      if (videoLink.endsWith(tag)) {
        targetServers = [SERVER_MAP[tag]]; // Sirf wahi ek specific server set karo
        finalVideoLink = videoLink.slice(0, -tag.length); // Link se tag hata do taaki yt-dlp error na de
        break; // Tag milte hi check karna band kar do
      }
    }

    const startTime = Date.now();
    const timeoutLimit = 90000; // 1.5 Minutes timeout

    while (Date.now() - startTime < timeoutLimit) {
      // Loop: Ab ye targetServers ke hisaab se chalega (Agar tag hoga toh sirf 1, warna 4)
      for (let server of targetServers) {
        try {
          // Yahan finalVideoLink bheja ja raha hai (bina #tag wala)
          const fetchUrl = `${server}?url=${encodeURIComponent(finalVideoLink)}`;
          const response = await fetch(fetchUrl, { method: 'GET' });
          
          if (response.status === 200) {
            const data = await response.json();
            if (data.status === "success") {
              return new Response(JSON.stringify(data), {
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
              });
            }
          }
          // Agar server 200 (Success) nahi deta, toh loop bina ruke agle par jayega
        } catch (err) {
          console.log("Checking next server...");
        }
      }
      
      // Jab saare available servers busy hon, sirf tab 1.5s wait karega
      await new Promise(r => setTimeout(r, 1500));
    }

    return new Response(JSON.stringify({ error: "All servers busy" }), {
      status: 504,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
};

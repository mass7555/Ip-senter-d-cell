// Aapke charon servers ki list (Yahan se /extract hata diya hai)
const SERVERS = [
  "https://mohd-an78-yt-api.hf.space",
  "https://mttc78-yt-impore.hf.space",
  "https://yt-api-ii4k.onrender.com",
  "https://fvd-api.onrender.com"
];

// Naya Dedicated Routing Logic (Tags map - yahan se bhi /extract hataya hai)
const SERVER_MAP = {
  "#90": "https://mohd-an78-yt-api.hf.space",
  "#80": "https://mttc78-yt-impore.hf.space",
  "#85": "https://yt-api-ii4k.onrender.com",
  "#95": "https://fvd-api.onrender.com"
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

    let targetServers = [...SERVERS]; // List ki copy banayi
    let finalVideoLink = videoLink; 
    let isTagged = false;

    // TAG CHECKING LOGIC
    for (const tag in SERVER_MAP) {
      if (videoLink.endsWith(tag)) {
        targetServers = [SERVER_MAP[tag]]; // Sirf wahi ek specific server set karo
        finalVideoLink = videoLink.slice(0, -tag.length); // Link se tag hata do
        isTagged = true;
        break; 
      }
    }

    // --- SMART LOAD BALANCING ---
    // Agar link normal hai (koi tag nahi), toh list ko Randomly shuffle kar do
    // Isse traffic kisi ek server par ikhatta nahi hoga aur speed tez aayegi!
    if (!isTagged) {
      targetServers.sort(() => Math.random() - 0.5);
    }

    const startTime = Date.now();
    const timeoutLimit = 45000; // 45 Seconds timeout rakha hai taaki app crash na ho

    while (Date.now() - startTime < timeoutLimit) {
      // Loop: Ab ye mix kiye hue servers par ek-ek karke jayega
      for (let server of targetServers) {
        try {
          // Yahan /?url= lagaya hai perfect format ke liye
          const fetchUrl = `${server}/?url=${encodeURIComponent(finalVideoLink)}`;
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
      }
      
      // Jab saare available servers busy hon, tabhi 1.5s wait karega
      await new Promise(r => setTimeout(r, 1500));
    }

    return new Response(JSON.stringify({ error: "All servers busy" }), {
      status: 504,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
};
        

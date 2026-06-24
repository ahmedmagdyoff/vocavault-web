export interface VideoProviderInfo {
  provider:
    | "youtube"
    | "tiktok"
    | "facebook"
    | "instagram-reel"
    | "instagram-post"
    | "other";
  videoId: string | null;
  embedUrl: string | null;
}

export function parseVideoUrl(url: string): VideoProviderInfo {
  if (!url) {
    return { provider: "other", videoId: null, embedUrl: null };
  }

  // YouTube Shorts or Regular YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
  );
  if (ytMatch && ytMatch[1]) {
    return {
      provider: "youtube",
      videoId: ytMatch[1],
      embedUrl: `https://youtube.com/embed/${ytMatch[1]}`,
    };
  }

  // TikTok
  const tiktokMatch = url.match(
    /tiktok\.com\/(?:@[^\/]+\/video\/|v\/)([\d]+)/i,
  );
  if (tiktokMatch && tiktokMatch[1]) {
    return {
      provider: "tiktok",
      videoId: tiktokMatch[1],
      embedUrl: `https://tiktok.com/embed/v2/${tiktokMatch[1]}`,
    };
  }

  // Facebook
  const fbMatch = url.match(
    /facebook\.com\/.*\/videos\/([\d]+)|facebook\.com\/watch\/?\?v=([\d]+)|fb\.watch\/([a-zA-Z0-9_-]+)/i,
  );
  if (fbMatch) {
    return {
      provider: "facebook",
      videoId: fbMatch[1] || fbMatch[2] || fbMatch[3],
      embedUrl: `https://facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=560`,
    };
  }

  // Instagram
  const igMatch = url.match(/instagram\.com\/(p|reel)\/([a-zA-Z0-9_-]+)/i);
  if (igMatch && igMatch[2]) {
    const isReel = igMatch[1].toLowerCase() === "reel";
    return {
      provider: isReel ? "instagram-reel" : "instagram-post",
      videoId: igMatch[2],
      embedUrl: `https://instagram.com/p/${igMatch[2]}/embed`,
    };
  }

  return { provider: "other", videoId: null, embedUrl: null };
}

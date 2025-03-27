
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.22.0";

// Define sources for different types of recovery resources
const RESOURCE_SOURCES = {
  articles: [
    { url: "https://api.rss2json.com/v1/api.json?rss_url=https://www.healthline.com/health/addiction/feed", source: "Healthline" },
    { url: "https://api.rss2json.com/v1/api.json?rss_url=https://www.verywellmind.com/addiction-recovery-4157298/feed", source: "VeryWellMind" }
  ],
  videos: [
    { playlistId: "PLpVN66Got78DVYGHh0DYvzkoNdoC2j0yz", source: "YouTube" }, // Example: TED Talks on addiction
    { playlistId: "PL26BCA8363A4B2177", source: "YouTube" }  // Example: Recovery-related playlist
  ]
};

// Resource types mapping
const TYPE_MAPPING: Record<string, string> = {
  "article": "article",
  "video": "video",
  "audio": "audio",
  "exercise": "exercise"
};

// Tags based on keywords in content
const TAG_KEYWORDS: Record<string, string[]> = {
  "science": ["neuroscience", "brain", "research", "study", "scientific"],
  "meditation": ["meditation", "mindfulness", "breathing", "calm", "relax"],
  "cbt": ["cognitive", "behavioral", "therapy", "cbt", "thoughts"],
  "relationships": ["relationship", "family", "partner", "social", "connection"],
  "nutrition": ["nutrition", "diet", "food", "eating", "health"],
  "exercise": ["exercise", "workout", "fitness", "physical", "activity"],
  "motivation": ["motivation", "inspiration", "purpose", "goal", "meaning"],
  "coping": ["coping", "strategy", "skill", "manage", "handle"],
  "education": ["education", "learn", "understand", "information", "knowledge"],
  "success-stories": ["success", "story", "overcome", "achievement", "recovery"],
  "beginner": ["beginner", "start", "new", "introduction", "basic"]
};

// Function to extract tags from text content
function extractTags(text: string): string[] {
  const lowercaseText = text.toLowerCase();
  return Object.entries(TAG_KEYWORDS)
    .filter(([_, keywords]) => keywords.some(keyword => lowercaseText.includes(keyword)))
    .map(([tag, _]) => tag)
    .slice(0, 5); // Limit to 5 tags max
}

// Function to estimate reading time
function estimateReadingTime(text: string): string {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

// Function to estimate video duration from YouTube
function formatVideoDuration(duration: string): string {
  // Format ISO 8601 duration to "X min watch"
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "Unknown duration";
  
  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")} hr watch`;
  } else {
    return `${minutes} min watch`;
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://bisrbwpjmtwfqkwvzdor.supabase.co";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpc3Jid3BqbXR3ZnFrd3Z6ZG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4NTkzODMsImV4cCI6MjA1ODQzNTM4M30.KvQuyChW0gYs-2HewFQGGtGmtj0z0Dt_Kr2g1klfkHg";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    let resourcesUpdated = 0;
    let resourcesAdded = 0;
    
    // Fetch articles from RSS feeds
    console.log("Fetching articles from RSS feeds...");
    for (const source of RESOURCE_SOURCES.articles) {
      try {
        const response = await fetch(source.url);
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
          // Process only the 5 most recent articles
          const recentItems = data.items.slice(0, 5);
          
          for (const item of recentItems) {
            // Extract image from content if available
            const imageRegex = /<img[^>]+src="([^">]+)"/i;
            const imageMatch = item.content.match(imageRegex);
            const imageUrl = imageMatch ? imageMatch[1] : "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
            
            // Extract tags from title and content
            const extractedTags = extractTags(item.title + " " + item.content);
            
            // Estimate reading time
            const duration = estimateReadingTime(item.content);
            
            // Check if the resource already exists (by URL)
            const { data: existingResource } = await supabase
              .from('recovery_resources')
              .select('id, updated_at')
              .eq('url', item.link)
              .maybeSingle();
              
            if (existingResource) {
              // Update existing resource
              const { error } = await supabase
                .from('recovery_resources')
                .update({
                  title: item.title,
                  description: item.description.replace(/<[^>]*>?/gm, '').substring(0, 250) + "...",
                  image_url: imageUrl,
                  tags: extractedTags,
                  duration: duration,
                  updated_at: new Date().toISOString()
                })
                .eq('id', existingResource.id);
                
              if (!error) resourcesUpdated++;
            } else {
              // Insert new resource
              const { error } = await supabase
                .from('recovery_resources')
                .insert({
                  title: item.title,
                  description: item.description.replace(/<[^>]*>?/gm, '').substring(0, 250) + "...",
                  type: 'article',
                  url: item.link,
                  image_url: imageUrl,
                  tags: extractedTags,
                  duration: duration,
                  source: source.source
                });
                
              if (!error) resourcesAdded++;
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching from ${source.url}:`, error);
      }
    }
    
    // For videos, we'd use YouTube API but that requires API key
    // In a real implementation, you would use YouTube API with proper authentication
    // For this demo, we'll just log that this would happen in a real implementation
    console.log("In a production environment, we would fetch videos from YouTube API");
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Resources updated: ${resourcesUpdated}, Resources added: ${resourcesAdded}`,
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error("Error updating resources:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});
